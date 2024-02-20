/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  makeGrantApplicationData,
  MakeGrantApplicationDataParams,
  makeRoundData,
} from "../../../test-utils";
import ViewApplicationPage from "../ViewApplicationPage";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import {
  ApplicationContext,
  ApplicationState,
  initialApplicationState,
} from "../../../context/application/ApplicationContext";
import { MemoryRouter } from "react-router-dom";
import {
  getApplicationsByRoundId,
  updateApplicationStatuses,
} from "../../api/application";
import { faker } from "@faker-js/faker";
import { RoundContext } from "../../../context/round/RoundContext";
import { useWallet } from "../../common/Auth";
import {
  BulkUpdateGrantApplicationContext,
  BulkUpdateGrantApplicationState,
  initialBulkUpdateGrantApplicationState,
} from "../../../context/application/BulkUpdateGrantApplicationContext";
import { GrantApplication, ProgressStatus } from "../../api/types";
import { errorModalDelayMs } from "../../../constants";
import moment from "moment";
import { ROUND_PAYOUT_DIRECT_OLD as ROUND_PAYOUT_DIRECT } from "common";

jest.mock("../../api/application");
jest.mock("../../common/Auth");

jest.mock("../../../constants", () => ({
  ...jest.requireActual("../../../constants"),
  errorModalDelayMs: 0, // NB: use smaller delay for faster tests
}));

const mockAddress = "0x0";
const mockWallet = {
  provider: {
    network: {
      chainId: 1,
    },
  },
  address: mockAddress,
  signer: {
    getChainId: () => {
      /* do nothing */
    },
  },
  chain: {
    name: "abc",
  },
};

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: "some-application-id",
    roundId: "some-round-id",
  }),
}));

const applicationIdOverride = "some-application-id";
const roundIdOverride = "some-round-id";

jest.mock("@gitcoinco/passport-sdk-verifier");
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("wagmi");

const verifyCredentialMock = jest.spyOn(
  PassportVerifier.prototype,
  "verifyCredential"
);

describe("ViewApplicationPage", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockImplementation(() => mockWallet);
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({});
  });

  it("should display 404 when no application is found", () => {
    (getApplicationsByRoundId as jest.Mock).mockRejectedValue(
      "No application :("
    );

    renderWithContext(<ViewApplicationPage />, {
      applications: [],
      isLoading: false,
    });

    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied!")).not.toBeInTheDocument();
  });

  it("should display access denied when wallet accessing is not round operator", () => {
    const application = makeGrantApplicationData({ applicationIdOverride });
    (getApplicationsByRoundId as any).mockResolvedValue(application);
    const wrongAddress = faker.finance.ethereumAddress();
    (useWallet as jest.Mock).mockImplementation(() => ({
      ...mockWallet,
      address: wrongAddress,
    }));

    renderWithContext(<ViewApplicationPage />, { applications: [application] });
    expect(screen.getByText("Access Denied!")).toBeInTheDocument();
    expect(screen.queryByText("404 ERROR")).not.toBeInTheDocument();
  });

  it("should display project's application answers", async () => {
    const expectedAnswers = [
      {
        questionId: 0,
        question: "Email Address",
        answer: "johndoe@example.com",
      },
      {
        questionId: 1,
        question: "Funding Sources",
        answer: "Founder capital",
      },
      {
        questionId: 2,
        question: "Team Size",
        answer: "10",
      },
    ];

    const grantApplicationWithApplicationAnswers = makeGrantApplicationData({
      applicationIdOverride,
      applicationAnswers: expectedAnswers,
    });

    (getApplicationsByRoundId as any).mockResolvedValue(
      grantApplicationWithApplicationAnswers
    );

    renderWithContext(<ViewApplicationPage />, {
      applications: [grantApplicationWithApplicationAnswers],
    });

    expect(
      await screen.findByText(expectedAnswers[0].answer)
    ).toBeInTheDocument();
  });

  describe("when approve or reject decision is selected", () => {
    let application: GrantApplication;

    beforeEach(() => {
      jest.clearAllMocks();
      application = makeGrantApplicationData({
        applicationIdOverride,
        roundIdOverride,
      });
      (getApplicationsByRoundId as any).mockResolvedValue(application);
    });

    it("should open confirmation modal when approve is clicked", async () => {
      renderWithContext(<ViewApplicationPage />, {
        applications: [application],
      });
      fireEvent.click(screen.getByText(/Approve/));

      expect(await screen.findByTestId("confirm-modal")).toBeInTheDocument();
    });

    it("should open confirmation modal when reject is clicked", async () => {
      renderWithContext(<ViewApplicationPage />, {
        applications: [application],
      });
      fireEvent.click(screen.getByText(/Reject/));

      expect(await screen.findByTestId("confirm-modal")).toBeInTheDocument();
    });

    it("should start the bulk update process to persist approve decision when confirm is selected", async () => {
      const transactionBlockNumber = 10;
      (updateApplicationStatuses as jest.Mock).mockResolvedValue(
        transactionBlockNumber
      );

      renderWithContext(<ViewApplicationPage />, {
        applications: [application],
      });
      fireEvent.click(screen.getByText(/Approve/));
      await screen.findByTestId("confirm-modal");
      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(() => {
        expect(updateApplicationStatuses).toBeCalled();
      });

      application.status = "APPROVED";

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const expected = {
        id: application.id,
        round: application.round,
        recipient: application.recipient,
        projectsMetaPtr: application.projectsMetaPtr,
        status: application.status,
      };

      expect(updateApplicationStatuses).toBeCalled();
      const updateApplicationStatusesFirstCall = (
        updateApplicationStatuses as jest.Mock
      ).mock.calls[0];
      const actualRoundId = updateApplicationStatusesFirstCall[0];
      expect(actualRoundId).toEqual(roundIdOverride);
    });

    it("should close the confirmation modal when cancel is selected", async () => {
      renderWithContext(<ViewApplicationPage />, {
        applications: [application],
      });
      fireEvent.click(screen.getByText(/Approve/));
      await screen.findByTestId("confirm-modal");
      fireEvent.click(screen.getByText("Cancel"));

      await waitFor(() => {
        expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
      });
    });

    it("shows error modal when reviewing application fails", async () => {
      const transactionBlockNumber = 10;
      (updateApplicationStatuses as jest.Mock).mockResolvedValue({
        transactionBlockNumber,
      });

      renderWithContext(
        <ViewApplicationPage />,
        {
          applications: [application],
        },
        {
          contractUpdatingStatus: ProgressStatus.IS_ERROR,
        }
      );

      fireEvent.click(screen.getByText(/Approve/));

      await screen.findByTestId("confirm-modal");
      fireEvent.click(screen.getByText("Confirm"));

      await waitFor(
        async () =>
          expect(await screen.findByTestId("error-modal")).toBeInTheDocument(),
        { timeout: errorModalDelayMs + 1000 }
      );
    });

    it("choosing done closes the error modal", async () => {
      const transactionBlockNumber = 10;
      (updateApplicationStatuses as jest.Mock).mockResolvedValue({
        transactionBlockNumber,
      });

      renderWithContext(
        <ViewApplicationPage />,
        {
          applications: [application],
        },
        {
          contractUpdatingStatus: ProgressStatus.IS_ERROR,
        }
      );

      fireEvent.click(screen.getByText(/Approve/));

      await screen.findByTestId("confirm-modal");
      fireEvent.click(screen.getByText("Confirm"));

      await screen.findByTestId("error-modal");

      const done = await screen.findByTestId("done");
      await act(() => {
        fireEvent.click(done);
      });

      expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
    });
  });

  describe("Sidebar steps", () => {
    let application: GrantApplication;

    beforeEach(() => {
      jest.clearAllMocks();
      application = makeGrantApplicationData({
        applicationIdOverride,
        roundIdOverride,
      });
      (getApplicationsByRoundId as any).mockResolvedValue(application);
    });

    it("should show application steps", async () => {
      renderWithContext(<ViewApplicationPage />, {
        applications: [application],
      });

      expect(
        await screen.findByTestId("sidebar-steps-container")
      ).toBeInTheDocument();
    });

    it("QF: should show pending:current, evaluation:inactive when application is Pending", async () => {
      renderWithContext(<ViewApplicationPage />, {
        applications: [
          makeGrantApplicationData({
            applicationIdOverride,
            roundIdOverride,
            status: "PENDING",
          }),
        ],
      });

      // Pending
      const pendingStep = await screen.findByTestId("application-step-pending");
      expect(
        within(pendingStep).queryByTestId("status-current")
      ).toBeInTheDocument();

      // Evaluation
      const evaluationStep = await screen.findByTestId(
        "application-step-Evaluation"
      );
      expect(
        within(evaluationStep).queryByTestId("status-none")
      ).toBeInTheDocument();
    });

    it("DR: should show pending:current, in-review and evaluation:inactive when application is Pending", async () => {
      const application = makeGrantApplicationData({
        applicationIdOverride,
        roundIdOverride,
        status: "PENDING",
        inReview: false,
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [],
        },
      });

      renderWithContext(<ViewApplicationPage />, {
        applications: [application],
      });

      // Pending
      const pendingStep = await screen.findByTestId("application-step-pending");
      expect(
        within(pendingStep).queryByTestId("status-current")
      ).toBeInTheDocument();

      // In review
      const inReviewStep = await screen.findByTestId(
        "application-step-In review"
      );
      expect(
        within(inReviewStep).queryByTestId("status-none")
      ).toBeInTheDocument();

      // Evaluation
      const evaluationStep = await screen.findByTestId(
        "application-step-Evaluation"
      );
      expect(
        within(evaluationStep).queryByTestId("status-none")
      ).toBeInTheDocument();
    });

    it("should show pending:done, approved:done when application is Approved", async () => {
      renderWithContext(<ViewApplicationPage />, {
        applications: [
          makeGrantApplicationData({
            applicationIdOverride,
            roundIdOverride,
            statusSnapshots: [
              {
                status: "PENDING",
                statusDescription: "PENDING",
                timestamp: moment().subtract(1, "day").toDate(),
              },
              {
                status: "APPROVED",
                statusDescription: "APPROVED",
                timestamp: moment().add(1, "day").toDate(),
              },
            ],
          }),
        ],
      });

      // Pending
      const pendingStep = await screen.findByTestId("application-step-pending");
      expect(
        within(pendingStep).queryByTestId("status-done")
      ).toBeInTheDocument();

      // Approved
      const approvedStep = await screen.findByTestId(
        "application-step-approved"
      );
      expect(
        within(approvedStep).queryByTestId("status-done")
      ).toBeInTheDocument();
    });

    it("should show pending:done, rejected:rejected when application is Rejected", async () => {
      renderWithContext(<ViewApplicationPage />, {
        applications: [
          makeGrantApplicationData({
            applicationIdOverride,
            roundIdOverride,
            statusSnapshots: [
              {
                status: "PENDING",
                statusDescription: "PENDING",
                timestamp: moment().subtract(2, "day").toDate(),
              },
              {
                status: "REJECTED",
                statusDescription: "REJECTED",
                timestamp: moment().add(1, "day").toDate(),
              },
            ],
          }),
        ],
      });

      // Pending
      const pendingStep = await screen.findByTestId("application-step-pending");
      expect(
        within(pendingStep).queryByTestId("status-done")
      ).toBeInTheDocument();

      // Rejected
      const rejectedStep = await screen.findByTestId(
        "application-step-rejected"
      );
      expect(
        within(rejectedStep).queryByTestId("status-rejected")
      ).toBeInTheDocument();
    });
  });

  describe("Payout for Direct Round", () => {
    let application: GrantApplication;

    beforeEach(() => {
      jest.clearAllMocks();
      application = makeGrantApplicationData({
        applicationIdOverride,
        roundIdOverride,
        applicationAnswers: [
          {
            questionId: 0,
            question: "Email Address",
            answer: "johndoe@example.com",
          },
          {
            questionId: 1,
            question: "Payout token",
            answer: "DAI",
          },
          {
            questionId: 2,
            question: "Payout wallet address",
            answer: "0x444",
          },
        ],
        status: "APPROVED",
        inReview: false,
        payoutStrategy: {
          id: "1",
          strategyName: ROUND_PAYOUT_DIRECT,
          payouts: [],
        },
      });
      (getApplicationsByRoundId as any).mockResolvedValue(application);
    });

    it("should show the ApplicationDirectPayoutComponent", async () => {
      renderWithContext(<ViewApplicationPage />, {
        applications: [application],
      });

      const payout = await screen.findByTestId("application-direct-payout");
      expect(payout).toBeInTheDocument();
    });
  });
});

describe("ViewApplicationPage verification badges", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockImplementation(() => mockWallet);
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({});
  });

  it("shows project twitter with no badge when there is no credential", async () => {
    const provider = "twitter";
    verifyCredentialMock.mockResolvedValue(true);
    const expectedTwitterHandle = faker.random.word();
    const grantApplicationWithNoVc = makeGrantApplicationData({
      applicationIdOverride,
      projectTwitterOverride: expectedTwitterHandle,
    });

    grantApplicationWithNoVc.project!.credentials = {};
    (getApplicationsByRoundId as any).mockResolvedValue(
      grantApplicationWithNoVc
    );

    renderWithContext(<ViewApplicationPage />, {
      applications: [grantApplicationWithNoVc],
    });

    expect(await screen.findByText(expectedTwitterHandle)).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${provider}-verifiable-credential`)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${provider}-verifiable-credential-unverified`)
    ).not.toBeInTheDocument();
  });

  it("shows project github organization with no badge when there is no credential", async () => {
    const provider = "github";
    verifyCredentialMock.mockResolvedValue(true);
    const expectedGithubOrganizationName = faker.random.word();
    const grantApplicationWithNoVc = makeGrantApplicationData({
      applicationIdOverride,
      projectGithubOverride: expectedGithubOrganizationName,
    });
    grantApplicationWithNoVc.project!.credentials = {};
    (getApplicationsByRoundId as any).mockResolvedValue(
      grantApplicationWithNoVc
    );

    renderWithContext(<ViewApplicationPage />, {
      applications: [grantApplicationWithNoVc],
    });

    expect(
      await screen.findByText(expectedGithubOrganizationName)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${provider}-verifiable-credential`)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${provider}-verifiable-credential-unverified`)
    ).not.toBeInTheDocument();
  });

  it.each([
    ["github", { projectGithubOverride: "some github handle" }],
    ["twitter", { projectTwitterOverride: "some twitter handle" }],
  ])(
    "shows project %s verification when you have a valid verifiable credential for it",
    async (provider: string, overrides: MakeGrantApplicationDataParams) => {
      verifyCredentialMock.mockResolvedValue(true);
      const grantApplicationWithValidVc = makeGrantApplicationData({
        applicationIdOverride,
        ...overrides,
      });
      (getApplicationsByRoundId as any).mockResolvedValue(
        grantApplicationWithValidVc
      );

      renderWithContext(<ViewApplicationPage />, {
        applications: [grantApplicationWithValidVc],
      });

      expect(
        await screen.findByTestId(`${provider}-verifiable-credential`)
      ).toBeInTheDocument();
    }
  );

  it("shows verified twitter badge when project twitter handle matches vc regardless of casing", async () => {
    const provider = "twitter";
    const handle = "someHandle";
    verifyCredentialMock.mockResolvedValue(true);
    const grantApplication = makeGrantApplicationData({
      applicationIdOverride,
      projectTwitterOverride: handle.toLowerCase(),
    });
    grantApplication.project!.projectTwitter = handle.toUpperCase();
    (getApplicationsByRoundId as any).mockResolvedValue(grantApplication);

    renderWithContext(<ViewApplicationPage />, {
      applications: [grantApplication],
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`${provider}-verifiable-credential`)
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`${provider}-verifiable-credential-unverified`)
    ).not.toBeInTheDocument();
  });

  it("shows verified github badge when project github handle matches vc regardless of casing", async () => {
    const provider = "github";
    const handle = "someHandle";
    verifyCredentialMock.mockResolvedValue(true);
    const grantApplication = makeGrantApplicationData({
      applicationIdOverride,
      projectGithubOverride: handle.toLowerCase(),
    });
    grantApplication.project!.projectGithub = handle.toUpperCase();
    (getApplicationsByRoundId as any).mockResolvedValue(grantApplication);

    renderWithContext(<ViewApplicationPage />, {
      applications: [grantApplication],
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`${provider}-verifiable-credential`)
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`${provider}-verifiable-credential-unverified`)
    ).not.toBeInTheDocument();
  });

  it.each([
    ["github", { projectGithubOverride: "some github handle" }],
    ["twitter", { projectTwitterOverride: "some twitter handle" }],
  ])(
    "shows no project %s verification when you have an invalid verifiable credential for it",
    async (provider: string, overrides: MakeGrantApplicationDataParams) => {
      verifyCredentialMock.mockResolvedValue(false);
      const grantApplicationStub = makeGrantApplicationData({
        applicationIdOverride,
        ...overrides,
      });
      (getApplicationsByRoundId as any).mockResolvedValue(grantApplicationStub);

      renderWithContext(<ViewApplicationPage />, {
        applications: [grantApplicationStub],
        isLoading: false,
      });

      await waitFor(() => {
        expect(
          screen.getByTestId(`${provider}-verifiable-credential-unverified`)
        ).toBeInTheDocument();
      });
      expect(
        screen.queryByTestId(`${provider}-verifiable-credential`)
      ).not.toBeInTheDocument();
    }
  );

  it.each(["github", "twitter"])(
    "shows no project %s verification when you do not have a verifiable credential for it",
    async (provider) => {
      const noGithubVerification = {
        application: makeGrantApplicationData({
          applicationIdOverride,
        }),
        isLoading: false,
      };
      (getApplicationsByRoundId as any).mockResolvedValue(
        noGithubVerification.application
      );

      renderWithContext(<ViewApplicationPage />, noGithubVerification);

      expect(
        screen.queryByTestId(`${provider}-verifiable-credential`)
      ).not.toBeInTheDocument();
    }
  );

  it("shows invalid badge when verifiable credential was not issued by correct IAM server", async () => {
    verifyCredentialMock.mockResolvedValue(true);
    const fakeIssuer =
      "did:key:z6Mks2YNwbkzDgKLuQs1TS3whP9RdXrGXtVqt5JcCLoQu86W";
    const grantApplication = makeGrantApplicationData({
      applicationIdOverride,
      projectGithubOverride: "whatever",
    });
    grantApplication.project!.credentials["github"].issuer = fakeIssuer;
    (getApplicationsByRoundId as any).mockResolvedValue(grantApplication);

    renderWithContext(<ViewApplicationPage />, {
      applications: [grantApplication],
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`github-verifiable-credential-unverified`)
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`github-verifiable-credential`)
    ).not.toBeInTheDocument();
  });

  it("shows no twitter badge when project twitter handle does not match verifiable credential", async () => {
    const provider = "twitter";
    const handle = "someHandle";
    verifyCredentialMock.mockResolvedValue(true);
    const grantApplication = makeGrantApplicationData({
      applicationIdOverride,
      projectTwitterOverride: handle,
    });
    grantApplication.project!.projectTwitter = "not some handle";
    (getApplicationsByRoundId as any).mockResolvedValue(grantApplication);

    renderWithContext(<ViewApplicationPage />, {
      applications: [grantApplication],
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`${provider}-verifiable-credential-unverified`)
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`${provider}-verifiable-credential`)
    ).not.toBeInTheDocument();
  });

  it("shows no github badge when project github handle does not match verifiable credential", async () => {
    const provider = "github";
    const handle = "someHandle";
    verifyCredentialMock.mockResolvedValue(true);
    const grantApplication = makeGrantApplicationData({
      applicationIdOverride,
      projectGithubOverride: handle,
    });
    grantApplication.project!.projectGithub = "not some handle";
    (getApplicationsByRoundId as any).mockResolvedValue(grantApplication);

    renderWithContext(<ViewApplicationPage />, {
      applications: [grantApplication],
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`${provider}-verifiable-credential-unverified`)
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`${provider}-verifiable-credential`)
    ).not.toBeInTheDocument();
  });

  it.each([
    ["github", { projectGithubOverride: "some github" }],
    ["twitter", { projectTwitterOverride: "some twitter" }],
  ])(
    "shows invalid $provider badge when project owner address does not match vc",
    async (provider, overrides: MakeGrantApplicationDataParams) => {
      verifyCredentialMock.mockResolvedValue(true);
      const grantApplicationData = makeGrantApplicationData({
        applicationIdOverride,
        ...overrides,
      });
      grantApplicationData.project!.owners.forEach((it) => {
        it.address = "bad";
      });
      (getApplicationsByRoundId as any).mockResolvedValue(grantApplicationData);

      renderWithContext(<ViewApplicationPage />, {
        applications: [grantApplicationData],
      });

      await screen.findByTestId(`${provider}-verifiable-credential-unverified`);
      expect(
        screen.queryByTestId(`${provider}-verifiable-credential`)
      ).not.toBeInTheDocument();
    }
  );
});

export const renderWithContext = (
  ui: JSX.Element,
  applicationStateOverrides: Partial<ApplicationState> = {},
  bulkUpdateGrantApplicationStateOverrides: Partial<BulkUpdateGrantApplicationState> = {},
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <BulkUpdateGrantApplicationContext.Provider
        value={{
          ...initialBulkUpdateGrantApplicationState,
          ...bulkUpdateGrantApplicationStateOverrides,
        }}
      >
        <RoundContext.Provider
          value={{
            state: {
              data: [
                makeRoundData({
                  id: roundIdOverride,
                  operatorWallets: [mockAddress],
                }),
              ],
              fetchRoundStatus: ProgressStatus.IS_SUCCESS,
            },
            dispatch,
          }}
        >
          <ApplicationContext.Provider
            value={{
              state: {
                ...initialApplicationState,
                ...applicationStateOverrides,
              },
              dispatch,
            }}
          >
            {ui}
          </ApplicationContext.Provider>
        </RoundContext.Provider>
      </BulkUpdateGrantApplicationContext.Provider>
    </MemoryRouter>
  );
