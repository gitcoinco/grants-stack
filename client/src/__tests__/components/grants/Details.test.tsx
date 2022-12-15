import "@testing-library/jest-dom";
import { act, cleanup, screen } from "@testing-library/react";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import Details from "../../../components/grants/Details";
import setupStore from "../../../store";
import {
  renderWrapped,
  buildVerifiableCredential,
  buildProjectMetadata,
} from "../../../utils/test_utils";

const IAM_SERVER = "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    chainId: "1",
    id: "2",
  }),
}));

const verifyCredentialMock = jest.spyOn(
  PassportVerifier.prototype,
  "verifyCredential"
);

describe("<Details />", () => {
  afterEach(() => {
    cleanup();
  });

  describe("credential verification badge", () => {
    test("should show two verification badges", async () => {
      const store = setupStore();
      const twitterHandle = "my-twitter-handle";
      const twitterVC = buildVerifiableCredential("Twitter", twitterHandle);
      twitterVC.issuer = IAM_SERVER;

      const githubHandle = "github-org-handle";
      const githubVC = buildVerifiableCredential("GithubOrg", githubHandle);
      githubVC.issuer = IAM_SERVER;

      const project = buildProjectMetadata({
        projectTwitter: twitterHandle,
        projectGithub: githubHandle,
        credentials: {
          twitter: twitterVC,
          github: githubVC,
        },
      });

      verifyCredentialMock.mockResolvedValue(true);

      await act(async () => {
        renderWrapped(
          <Details
            project={project}
            createdAt={new Date().toString()}
            updatedAt={new Date().toString()}
            bannerImg="img"
            logoImg="img"
            showApplications={false}
          />,
          store
        );
      });

      expect(screen.queryAllByText("Verified").length).toBe(2);
    });
    test("should show one verification badge", async () => {
      const store = setupStore();
      const twitterHandle = "my-twitter-handle";
      const twitterVC = buildVerifiableCredential("Twitter", twitterHandle);
      twitterVC.issuer = IAM_SERVER;

      const githubHandle = "github-org-handle";

      const project = buildProjectMetadata({
        projectTwitter: twitterHandle,
        projectGithub: githubHandle,
        credentials: {
          twitter: twitterVC,
        },
      });

      verifyCredentialMock.mockResolvedValue(true);

      await act(async () => {
        renderWrapped(
          <Details
            project={project}
            createdAt={new Date().toString()}
            updatedAt={new Date().toString()}
            bannerImg="img"
            logoImg="img"
            showApplications={false}
          />,
          store
        );
      });

      expect(screen.queryByText("Verified")).toBeInTheDocument();
    });

    test("should not show the badge if the verified account is different from the current ones in the form", async () => {
      const store = setupStore();
      const twitterHandle = "my-twitter-handle";
      const twitterVC = buildVerifiableCredential("Twitter", twitterHandle);
      twitterVC.issuer = IAM_SERVER;

      const githubHandle = "github-org-handle";
      const githubVC = buildVerifiableCredential("GithubOrg", githubHandle);
      githubVC.issuer = IAM_SERVER;

      const project = buildProjectMetadata({
        projectTwitter: "random-handle",
        projectGithub: "random-handle",
        credentials: {
          twitter: twitterVC,
          github: githubVC,
        },
      });

      verifyCredentialMock.mockResolvedValue(true);

      await act(async () => {
        renderWrapped(
          <Details
            project={project}
            createdAt={new Date().toString()}
            updatedAt={new Date().toString()}
            bannerImg="img"
            logoImg="img"
            showApplications={false}
          />,
          store
        );
      });

      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    });

    test("should not show the badge if the credential is not verified", async () => {
      const store = setupStore();
      const twitterHandle = "my-twitter-handle";
      const twitterVC = buildVerifiableCredential("Twitter", twitterHandle);
      twitterVC.issuer = IAM_SERVER;

      const githubHandle = "github-org-handle";
      const githubVC = buildVerifiableCredential("GithubOrg", githubHandle);
      githubVC.issuer = IAM_SERVER;

      const project = buildProjectMetadata({
        projectTwitter: twitterHandle,
        projectGithub: githubHandle,
        credentials: {
          twitter: twitterVC,
          github: githubVC,
        },
      });

      verifyCredentialMock.mockResolvedValue(false);

      await act(async () => {
        renderWrapped(
          <Details
            project={project}
            createdAt={new Date().toString()}
            updatedAt={new Date().toString()}
            bannerImg="img"
            logoImg="img"
            showApplications={false}
          />,
          store
        );
      });

      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    });
  });
});
