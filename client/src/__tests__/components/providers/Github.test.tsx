import "@testing-library/jest-dom";
import { act, cleanup, screen } from "@testing-library/react";
import { PassportVerifier } from "@gitcoinco/passport-sdk-verifier";
import Github from "../../../components/providers/Github";
import setupStore from "../../../store";
import {
  renderWrapped,
  buildVerifiableCredential,
  buildProjectMetadata,
  buildFormMetadata,
} from "../../../utils/test_utils";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    chainId: "1",
    registryAddress: "2",
    id: "3",
  }),
}));

const verifyCredentialMock = jest.spyOn(
  PassportVerifier.prototype,
  "verifyCredential"
);

const IAM_SERVER = "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";

describe("<Github />", () => {
  afterEach(() => {
    cleanup();
  });

  describe("with account already verified", () => {
    test("should show the verification badge after verifying the vc", async () => {
      const store = setupStore();
      const handle = "github-org-handle";
      const vc = buildVerifiableCredential("GithubOrg", handle);
      vc.issuer = IAM_SERVER;

      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: buildProjectMetadata({
          id: "1:2:3",
          projectGithub: handle,
          credentials: { github: vc },
        }),
      });

      store.dispatch({
        type: "METADATA_SAVED",
        metadata: buildFormMetadata({
          projectGithub: handle,
        }),
      });

      verifyCredentialMock.mockResolvedValue(true);

      await act(async () => {
        renderWrapped(
          <Github
            org={handle}
            verificationComplete={() => {}}
            verificationError={() => {}}
            canVerify
          />,
          store
        );
      });

      expect(screen.queryByText("Verified")).toBeInTheDocument();
    });

    test("should not show the badge if the verified account is different from the current one in the form", async () => {
      const store = setupStore();
      const handle = "github-org-handle";
      const vc = buildVerifiableCredential("GithubOrg", handle);
      vc.issuer = IAM_SERVER;

      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: buildProjectMetadata({
          id: "1:2:3",
          projectGithub: handle,
          credentials: { github: vc },
        }),
      });

      store.dispatch({
        type: "METADATA_SAVED",
        metadata: buildFormMetadata({
          projectGithub: "another-Github-account",
        }),
      });

      verifyCredentialMock.mockResolvedValue(true);

      await act(async () => {
        renderWrapped(
          <Github
            org={handle}
            verificationComplete={() => {}}
            verificationError={() => {}}
            canVerify
          />,
          store
        );
      });

      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    });

    test("should not show the badge if the `issuer did` does not match the `IAM did`", async () => {
      const store = setupStore();
      const handle = "github-org-handle";
      const vc = buildVerifiableCredential("GithubOrg", handle);
      vc.issuer =
        "did:key:rAndomDiDRanDOmdidrAndomDiDRanDOmdidrAndomDiDRanDOmdid";

      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: buildProjectMetadata({
          id: "1:2:3",
          projectGithub: handle,
          credentials: { github: vc },
        }),
      });

      store.dispatch({
        type: "METADATA_SAVED",
        metadata: buildFormMetadata({
          projectGithub: handle,
        }),
      });

      verifyCredentialMock.mockResolvedValue(true);

      await act(async () => {
        renderWrapped(
          <Github
            org={handle}
            verificationComplete={() => {}}
            verificationError={() => {}}
            canVerify
          />,
          store
        );
      });

      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    });
    test("should not show the badge if the credential is invalid", async () => {
      const store = setupStore();
      const handle = "github-org-handle";
      const vc = buildVerifiableCredential("GithubOrg", handle);
      vc.issuer = IAM_SERVER;

      store.dispatch({
        type: "GRANT_METADATA_FETCHED",
        data: buildProjectMetadata({
          id: "1:2:3",
          projectGithub: handle,
          credentials: { github: vc },
        }),
      });

      store.dispatch({
        type: "METADATA_SAVED",
        metadata: buildFormMetadata({
          projectGithub: handle,
        }),
      });

      await act(async () => {
        renderWrapped(
          <Github
            org={handle}
            verificationComplete={() => {}}
            verificationError={() => {}}
            canVerify
          />,
          store
        );
      });

      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    });
  });
});
