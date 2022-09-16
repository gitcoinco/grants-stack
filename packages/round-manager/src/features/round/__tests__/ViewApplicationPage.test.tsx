/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApplicationAndCredentialRelatedData,
  makeApplicationAndCredentialRelatedDataForGithub,
  makeApplicationAndCredentialRelatedDataForTwitter,
  makeGrantApplicationData,
  makeRoundData,
} from "../../../test-utils";
import ViewApplicationPage from "../ViewApplicationPage";
import { render, screen, waitFor } from "@testing-library/react";
import { useListRoundsQuery } from "../../api/services/round";
import { useUpdateGrantApplicationMutation } from "../../api/services/grantApplication";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import { AnswerBlock } from "../../api/types";
import {
  ApplicationContext,
  ApplicationState,
  initialApplicationState,
} from "../../../context/ApplicationContext";
import { MemoryRouter } from "react-router-dom";
import { getApplicationById } from "../../api/application";
import { faker } from "@faker-js/faker";

jest.mock("../../api/services/grantApplication");
jest.mock("../../api/application");
jest.mock("../../api/services/round");
jest.mock("../../common/Auth", () => ({
  useWallet: () => ({
    provider: {
      getNetwork: () => ({
        chainId: "abc",
      }),
    },
    address: mockAddress,
  }),
}));
const mockAddress = "0x0";

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
    (useListRoundsQuery as any).mockReturnValue({
      round: { operatorWallets: [mockAddress] },
    });
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({});
  });

  it.each([
    ["github", [makeApplicationAndCredentialRelatedDataForGithub()]],
    ["twitter", [makeApplicationAndCredentialRelatedDataForTwitter()]],
  ])(
    "shows no project %s verification when you have an invalid verifiable credential for it",
    async (
      provider: string,
      applicationAndCredentialRelatedData: ApplicationAndCredentialRelatedData[]
    ) => {
      verifyCredentialMock.mockResolvedValue(false);
      const grantApplicationStub = makeGrantApplicationData(
        applicationAndCredentialRelatedData
      );
      (getApplicationById as any).mockResolvedValue(grantApplicationStub);
      (useUpdateGrantApplicationMutation as any).mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ]);

      renderWithContext(<ViewApplicationPage />, {
        application: grantApplicationStub,
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
        application: makeGrantApplicationData(),
        isLoading: false,
      };
      (getApplicationById as any).mockResolvedValue(
        noGithubVerification.application
      );
      (useUpdateGrantApplicationMutation as any).mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ]);

      renderWithContext(<ViewApplicationPage />, noGithubVerification);

      expect(
        screen.queryByTestId(`${provider}-verifiable-credential`)
      ).not.toBeInTheDocument();
    }
  );

  it.each([
    ["github", [makeApplicationAndCredentialRelatedDataForGithub()]],
    ["twitter", [makeApplicationAndCredentialRelatedDataForTwitter()]],
  ])(
    "shows project %s verification when you have a valid verifiable credential for it",
    async (
      provider: string,
      applicationAndCredentialRelatedData: ApplicationAndCredentialRelatedData[]
    ) => {
      verifyCredentialMock.mockResolvedValue(true);
      const grantApplicationWithValidVc = makeGrantApplicationData(
        applicationAndCredentialRelatedData
      );
      (getApplicationById as any).mockResolvedValue(
        grantApplicationWithValidVc
      );
      (useUpdateGrantApplicationMutation as any).mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ]);

      renderWithContext(<ViewApplicationPage />, {
        application: grantApplicationWithValidVc,
      });

      expect(
        await screen.findByTestId(`${provider}-verifiable-credential`)
      ).toBeInTheDocument();
    }
  );

  it("shows invalid badge when verifiable credential was not issued by correct IAM server", async () => {
    verifyCredentialMock.mockResolvedValue(true);
    const fakeIssuer =
      "did:key:z6Mks2YNwbkzDgKLuQs1TS3whP9RdXrGXtVqt5JcCLoQu86W";
    const grantApplication = makeGrantApplicationData([
      makeApplicationAndCredentialRelatedDataForGithub(),
    ]);
    grantApplication.project!.credentials["github"].issuer = fakeIssuer;
    (getApplicationById as any).mockResolvedValue(grantApplication);
    (useUpdateGrantApplicationMutation as any).mockReturnValue([
      jest.fn(),
      { isLoading: false },
    ]);

    renderWithContext(<ViewApplicationPage />, {
      application: grantApplication,
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

  it.each([
    {
      provider: "github",
      applicationAndVCRelatedDataArray: [
        makeApplicationAndCredentialRelatedDataForGithub(),
      ],
      question: "Github Organization",
      applicationAccountName: "notgitcoinco",
    },
    {
      provider: "twitter",
      applicationAndVCRelatedDataArray: [
        makeApplicationAndCredentialRelatedDataForTwitter(),
      ],
      question: "Twitter",
      applicationAccountName: "notDpoppDev",
    },
  ])(
    "shows invalid badge for $provider when $question account name in grant application doesn't match account name in VC provider",
    async ({
      provider,
      applicationAndVCRelatedDataArray,
      question,
      applicationAccountName,
    }) => {
      const grantApplication = makeGrantApplicationData(
        applicationAndVCRelatedDataArray
      );
      const wrongAnswers: AnswerBlock[] = [
        {
          questionId: 0,
          question,
          answer: applicationAccountName,
        },
      ];
      grantApplication.answers = wrongAnswers;
      (getApplicationById as any).mockResolvedValue(grantApplication);
      (useUpdateGrantApplicationMutation as any).mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ]);

      renderWithContext(<ViewApplicationPage />, {
        application: grantApplication,
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

  it.each([
    {
      provider: "github",
      applicationAndVCRelatedDataArray: [
        makeApplicationAndCredentialRelatedDataForGithub(),
      ],
    },
    {
      provider: "twitter",
      applicationAndVCRelatedDataArray: [
        makeApplicationAndCredentialRelatedDataForTwitter(),
      ],
    },
  ])(
    "shows invalid $provider badge when project owner address does not match vc",
    async ({ provider, applicationAndVCRelatedDataArray }) => {
      (useUpdateGrantApplicationMutation as any).mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ]);
      verifyCredentialMock.mockResolvedValue(true);
      const grantApplicationData = makeGrantApplicationData(
        applicationAndVCRelatedDataArray
      );
      grantApplicationData!.project!.owners.forEach((it) => {
        it.address = "bad";
      });
      (getApplicationById as any).mockResolvedValue(grantApplicationData);

      renderWithContext(<ViewApplicationPage />, {
        application: grantApplicationData,
      });

      await screen.findByTestId(`${provider}-verifiable-credential-unverified`);
      expect(
        screen.queryByTestId(`${provider}-verifiable-credential`)
      ).not.toBeInTheDocument();
    }
  );

  it("should display 404 when there no application is found", () => {
    (getApplicationById as jest.Mock).mockRejectedValue("No application :(");
    (useUpdateGrantApplicationMutation as any).mockReturnValue([
      jest.fn(),
      { isLoading: false },
    ]);

    renderWithContext(<ViewApplicationPage />, {
      application: undefined,
      isLoading: false,
      getApplicationByIdError: new Error("No application :("),
    });

    expect(screen.getByText("404 ERROR")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied!")).not.toBeInTheDocument();
  });

  it("should display access denied when wallet accessing is not round operator", () => {
    const application = makeGrantApplicationData();
    (getApplicationById as any).mockResolvedValue(application);
    (useUpdateGrantApplicationMutation as any).mockReturnValue([
      jest.fn(),
      { isLoading: false },
    ]);
    (useListRoundsQuery as any).mockReturnValue({
      round: makeRoundData({
        operatorWallets: [faker.finance.ethereumAddress()],
      }),
    });

    renderWithContext(<ViewApplicationPage />, { application });
    expect(screen.getByText("Access Denied!")).toBeInTheDocument();
    expect(screen.queryByText("404 ERROR")).not.toBeInTheDocument();
  });
});

export const renderWithContext = (
  ui: JSX.Element,
  applicationStateOverrides: Partial<ApplicationState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <ApplicationContext.Provider
        value={{
          state: { ...initialApplicationState, ...applicationStateOverrides },
          dispatch,
        }}
      >
        {ui}
      </ApplicationContext.Provider>
    </MemoryRouter>
  );
