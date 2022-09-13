/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  githubCredentialData,
  makeGrantApplicationData,
  renderWrapped,
  twitterCredentialData,
} from "../../../test-utils";
import ViewApplicationPage from "../ViewApplicationPage";
import { screen, waitFor } from "@testing-library/react";
import { useListRoundsQuery } from "../../api/services/round";
import {
  useListGrantApplicationsQuery,
  useUpdateGrantApplicationMutation,
} from "../../api/services/grantApplication";
import { useDisconnect, useSwitchNetwork } from "wagmi";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import { ProjectCredentials } from "../../api/types";

jest.mock("../../api/services/grantApplication");
jest.mock("../../api/services/round");
jest.mock("../../common/Auth", () => ({
  useWallet: () => ({ provider: {} }),
}));
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
    (useListRoundsQuery as any).mockReturnValue({ round: {} });
    (useSwitchNetwork as any).mockReturnValue({ chains: [] });
    (useDisconnect as any).mockReturnValue({});
  });

  it.each([
    ["github", { github: githubCredentialData }],
    ["twitter", { twitter: twitterCredentialData }],
  ])(
    "shows no project %s verification when you have an invalid verifiable credential for it",
    async (provider: string, projectCredentials: ProjectCredentials) => {
      verifyCredentialMock.mockResolvedValue(false);

      const verifiableGithubCredential = {
        application: makeGrantApplicationData({}, projectCredentials),
      };

      (useListGrantApplicationsQuery as any).mockReturnValue(
        verifiableGithubCredential
      );
      (useUpdateGrantApplicationMutation as any).mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ]);
      (useListRoundsQuery as any).mockReturnValue({ round: {} });
      (useSwitchNetwork as any).mockReturnValue({ chains: [] });
      (useDisconnect as any).mockReturnValue({});

      await renderWrapped(<ViewApplicationPage />);

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
      (useListGrantApplicationsQuery as any).mockReturnValue(
        noGithubVerification
      );
      (useUpdateGrantApplicationMutation as any).mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ]);

      renderWrapped(<ViewApplicationPage />);

      expect(
        screen.queryByTestId(`${provider}-verifiable-credential`)
      ).not.toBeInTheDocument();
    }
  );

  it.each([
    ["github", { github: githubCredentialData }],
    ["twitter", { twitter: twitterCredentialData }],
  ])(
    "shows project %s verification when you have a valid verifiable credential for it",
    async (provider: string, projectCredentials: ProjectCredentials) => {
      verifyCredentialMock.mockResolvedValue(true);

      const grantApplicationWithValidVc = {
        application: makeGrantApplicationData({}, projectCredentials),
      };

      (useListGrantApplicationsQuery as any).mockReturnValue(
        grantApplicationWithValidVc
      );
      (useUpdateGrantApplicationMutation as any).mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ]);

      renderWrapped(<ViewApplicationPage />);

      expect(
        await screen.findByTestId(`${provider}-verifiable-credential`)
      ).toBeInTheDocument();
    }
  );

  it("shows invalid badge when verifiable credential was not issued by correct IAM server", async () => {
    verifyCredentialMock.mockResolvedValue(true);
    const fakeIssuer =
      "did:key:z6Mks2YNwbkzDgKLuQs1TS3whP9RdXrGXtVqt5JcCLoQu86W";

    const projectCredentials = { github: { ...githubCredentialData } };
    projectCredentials.github.issuer = fakeIssuer;

    const grantApplication = {
      application: makeGrantApplicationData({}, projectCredentials),
    };

    (useListGrantApplicationsQuery as any).mockReturnValue(grantApplication);
    (useUpdateGrantApplicationMutation as any).mockReturnValue([
      jest.fn(),
      { isLoading: false },
    ]);

    renderWrapped(<ViewApplicationPage />);

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
      projectCredentials: {
        github: githubCredentialData,
      } as ProjectCredentials,
      vcProviderString: "ClearTextGithubOrg#gitcoinco#6887938",
      question: "Github Organization",
      applicationAccountName: "notgitcoinco",
    },
    {
      provider: "twitter",
      projectCredentials: {
        twitter: twitterCredentialData,
      } as ProjectCredentials,
      vcProviderString: "ClearTextTwitter#DpoppDev",
      question: "Twitter",
      applicationAccountName: "notDpoppDev",
    },
  ])(
    "shows invalid badge for $provider when $question account name in grant application doesn't match account name in VC provider",
    async ({
      provider,
      projectCredentials,
      vcProviderString,
      question,
      applicationAccountName,
    }) => {
      projectCredentials[provider].credentialSubject.provider =
        vcProviderString;

      const grantApplication = {
        application: makeGrantApplicationData(
          {
            answers: [
              { questionId: 0, question, answer: applicationAccountName },
            ],
          },
          projectCredentials
        ),
      };

      (useListGrantApplicationsQuery as any).mockReturnValue(grantApplication);
      (useUpdateGrantApplicationMutation as any).mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ]);
      (useListRoundsQuery as any).mockReturnValue({ round: {} });
      (useSwitchNetwork as any).mockReturnValue({ chains: [] });
      (useDisconnect as any).mockReturnValue({});

      renderWrapped(<ViewApplicationPage />);

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
});
