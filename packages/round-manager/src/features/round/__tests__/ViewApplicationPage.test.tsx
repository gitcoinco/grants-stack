/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from "@faker-js/faker";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  AlloOperation,
  PassportVerifierWithExpiration,
  ROUND_PAYOUT_DIRECT_OLD as ROUND_PAYOUT_DIRECT,
  useAllo,
} from "common";
import moment from "moment";
import { MemoryRouter } from "react-router-dom";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { errorModalDelayMs } from "../../../constants";
import {
  BulkUpdateGrantApplicationContext,
  BulkUpdateGrantApplicationState,
  initialBulkUpdateGrantApplicationState,
} from "../../../context/application/BulkUpdateGrantApplicationContext";
import { RoundContext } from "../../../context/round/RoundContext";
import {
  MakeGrantApplicationDataParams,
  makeGrantApplicationData,
  makeRoundData,
} from "../../../test-utils";
import { GrantApplication, ProgressStatus } from "../../api/types";
import { useWallet } from "../../common/Auth";
import { useApplicationsByRoundId } from "../../common/useApplicationsByRoundId";
import ViewApplicationPage from "../ViewApplicationPage";

jest.mock("data-layer", () => ({
  ...jest.requireActual("data-layer"),
  useDataLayer: () => ({}),
}));

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  useAllo: jest.fn(),
}));

jest.mock("../../api/application");
jest.mock("../../common/Auth");

jest.mock("../../../constants", () => ({
  // ...jest.requireActual("../../../constants"),
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

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: jest.fn(),
}));
jest.mock("wagmi");

jest.mock("../../common/useApplicationsByRoundId");

const verifyCredentialMock = jest.spyOn(
  PassportVerifierWithExpiration.prototype,
  "verifyCredential"
);

describe("ViewApplicationPage", () => {
  let mockBulkUpdateApplicationStatus: jest.Mock;

  beforeEach(() => {
    (useWallet as jest.Mock).mockImplementation(() => mockWallet);
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({});

    mockBulkUpdateApplicationStatus = jest.fn().mockImplementation(() => {
      return new AlloOperation(async () => ({
        type: "success",
      }));
    });
    (useAllo as jest.Mock).mockImplementation(() => ({
      bulkUpdateApplicationStatus: mockBulkUpdateApplicationStatus,
    }));
  });

  it("should display 404 when no application is found", () => {
    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithContext(<ViewApplicationPage />);

    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied!")).not.toBeInTheDocument();
  });

  it("should display access denied when wallet accessing is not round operator", async () => {
    const application = makeGrantApplicationData({ applicationIdOverride });
    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [application],
      isLoading: false,
    });

    const wrongAddress = faker.finance.ethereumAddress();
    (useWallet as jest.Mock).mockImplementation(() => ({
      ...mockWallet,
      address: wrongAddress,
    }));

    renderWithContext(<ViewApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText("Access Denied!")).toBeInTheDocument();
      expect(screen.queryByText("404 ERROR")).not.toBeInTheDocument();
    });
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

    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [grantApplicationWithApplicationAnswers],
      isLoading: false,
    });

    renderWithContext(<ViewApplicationPage />);

    expect(
      await screen.findByText(expectedAnswers[0].answer)
    ).toBeInTheDocument();
  });

  describe("when approve or reject decision is selected", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      const application = makeGrantApplicationData({
        applicationIdOverride,
        roundIdOverride,
        status: "PENDING",
      });

      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [application],
        isLoading: false,
      });
    });

    it("should open confirmation modal when approve is clicked", async () => {
      renderWithContext(<ViewApplicationPage />);
      await waitFor(() => {
        screen.getByText(/Approve/);
      });
      fireEvent.click(screen.getByText(/Approve/));

      expect(await screen.findByTestId("confirm-modal")).toBeInTheDocument();
    });

    it("should open confirmation modal when reject is clicked", async () => {
      renderWithContext(<ViewApplicationPage />);
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Reject/));
      });

      expect(await screen.findByTestId("confirm-modal")).toBeInTheDocument();
    });

    it("should start the bulk update process to persist approve decision when confirm is selected", async () => {
      renderWithContext(<ViewApplicationPage />);

      fireEvent.click(screen.getByText(/Approve/));

      await screen.findByTestId("confirm-modal");
      fireEvent.click(screen.getByText("Confirm"));

      expect(mockBulkUpdateApplicationStatus).toBeCalled();

      const updateApplicationStatusesFirstCall =
        mockBulkUpdateApplicationStatus.mock.calls[0];
      const actualRoundId = updateApplicationStatusesFirstCall[0].roundId;
      expect(actualRoundId).toEqual(roundIdOverride);
    });

    it("should close the confirmation modal when cancel is selected", async () => {
      renderWithContext(<ViewApplicationPage />);

      await waitFor(() => {
        expect(screen.getByText(/Approve/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Approve/));
      await screen.findByTestId("confirm-modal");
      fireEvent.click(screen.getByText("Cancel"));

      await waitFor(() => {
        expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
      });
    });

    it("shows error modal when reviewing application fails", async () => {
      renderWithContext(<ViewApplicationPage />, {
        contractUpdatingStatus: ProgressStatus.IS_ERROR,
      });

      await waitFor(() => {
        expect(screen.getByText(/Approve/)).toBeInTheDocument();
      });

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
      renderWithContext(<ViewApplicationPage />, {
        contractUpdatingStatus: ProgressStatus.IS_ERROR,
      });

      await waitFor(() => {
        screen.getByText(/Approve/);
      });

      fireEvent.click(screen.getByText(/Approve/));

      await screen.findByTestId("confirm-modal");
      fireEvent.click(screen.getByText("Confirm"));

      await screen.findByTestId("error-modal");

      const done = await screen.findByTestId("done");
      act(() => {
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
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [application],
        isLoading: false,
      });
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
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [
          makeGrantApplicationData({
            applicationIdOverride,
            roundIdOverride,
            status: "PENDING",
          }),
        ],
        isLoading: false,
      });

      renderWithContext(<ViewApplicationPage />, {});

      // Pending
      const pendingStep = await screen.findByTestId("application-step-Pending");
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

    it("DG: should show pending:current, in-review and evaluation:inactive when application is Pending", async () => {
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
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [application],
        isLoading: false,
      });

      renderWithContext(<ViewApplicationPage />, {});

      // screen.logTestingPlaygroundURL();

      // Pending
      const pendingStep = await screen.findByTestId("application-step-Pending");
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
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [
          makeGrantApplicationData({
            applicationIdOverride,
            roundIdOverride,
            statusSnapshots: [
              {
                status: "PENDING",
                updatedAt: moment().subtract(1, "day").toDate(),
              },
              {
                status: "APPROVED",
                updatedAt: moment().add(1, "day").toDate(),
              },
            ],
          }),
        ],
        isLoading: false,
      });

      renderWithContext(<ViewApplicationPage />, {});

      // Pending
      const pendingStep = await screen.findByTestId("application-step-Pending");
      expect(
        within(pendingStep).queryByTestId("status-done")
      ).toBeInTheDocument();

      // Approved
      const approvedStep = await screen.findByTestId(
        "application-step-Approved"
      );
      expect(
        within(approvedStep).queryByTestId("status-done")
      ).toBeInTheDocument();
    });

    it("should show pending:done, rejected:rejected when application is Rejected", async () => {
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [
          makeGrantApplicationData({
            applicationIdOverride,
            roundIdOverride,
            statusSnapshots: [
              {
                status: "PENDING",
                updatedAt: moment().subtract(2, "day").toDate(),
              },
              {
                status: "REJECTED",
                updatedAt: moment().add(1, "day").toDate(),
              },
            ],
          }),
        ],
        isLoading: false,
      });

      renderWithContext(<ViewApplicationPage />, {});

      // Pending
      const pendingStep = await screen.findByTestId("application-step-Pending");
      expect(
        within(pendingStep).queryByTestId("status-done")
      ).toBeInTheDocument();

      // Rejected
      const rejectedStep = await screen.findByTestId(
        "application-step-Rejected"
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
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [application],
        isLoading: false,
      });
    });

    it("should show the ApplicationDirectPayoutComponent", async () => {
      renderWithContext(<ViewApplicationPage />);

      await waitFor(async () => {
        const payout = await screen.findByTestId("application-direct-payout");
        expect(payout).toBeInTheDocument();
      });
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

    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [grantApplicationWithNoVc],
      isLoading: false,
    });

    renderWithContext(<ViewApplicationPage />, {});

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

    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [grantApplicationWithNoVc],
      isLoading: false,
    });

    renderWithContext(<ViewApplicationPage />, {});

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

      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [grantApplicationWithValidVc],
        isLoading: false,
      });

      renderWithContext(<ViewApplicationPage />, {});

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

    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [grantApplication],
      isLoading: false,
    });

    renderWithContext(<ViewApplicationPage />, {});

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

    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [grantApplication],
      isLoading: false,
    });

    renderWithContext(<ViewApplicationPage />, {});

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
      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [grantApplicationStub],
        isLoading: false,
      });

      renderWithContext(<ViewApplicationPage />, {});

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

      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [noGithubVerification.application],
        isLoading: false,
      });

      renderWithContext(<ViewApplicationPage />);

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

    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [grantApplication],
      isLoading: false,
    });

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
    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [grantApplication],
      isLoading: false,
    });

    renderWithContext(<ViewApplicationPage />, {});

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

    (useApplicationsByRoundId as jest.Mock).mockReturnValue({
      data: [grantApplication],
      isLoading: false,
    });

    renderWithContext(<ViewApplicationPage />, {});

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

      (useApplicationsByRoundId as jest.Mock).mockReturnValue({
        data: [grantApplicationData],
        isLoading: false,
      });

      renderWithContext(<ViewApplicationPage />, {});

      await screen.findByTestId(`${provider}-verifiable-credential-unverified`);
      expect(
        screen.queryByTestId(`${provider}-verifiable-credential`)
      ).not.toBeInTheDocument();
    }
  );
});

export const renderWithContext = (
  ui: JSX.Element,
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
          {ui}
        </RoundContext.Provider>
      </BulkUpdateGrantApplicationContext.Provider>
    </MemoryRouter>
  );
