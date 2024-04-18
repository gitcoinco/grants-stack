import "@testing-library/jest-dom";
import { act, cleanup, screen } from "@testing-library/react";
import { PassportVerifierWithExpiration } from "common";
import Twitter from "../../../components/providers/Twitter";
import setupStore from "../../../store";
import {
  renderWrapped,
  buildVerifiableCredential,
  buildFormMetadata,
} from "../../../utils/test_utils";
import { credentialsSaved } from "../../../actions/projectForm";

const IAM_SERVER = "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC";

describe("<Twitter />", () => {
  afterEach(() => {
    cleanup();
  });

  describe("with account already verified", () => {
    test("should show the verification badge after verifying the vc", async () => {
      const store = setupStore();
      const handle = "my-twitter-handle";
      const vc = buildVerifiableCredential("Twitter", handle);
      vc.issuer = IAM_SERVER;

      store.dispatch({
        type: "METADATA_SAVED",
        metadata: buildFormMetadata({
          projectTwitter: handle,
        }),
      });

      store.dispatch(
        credentialsSaved({
          twitter: vc,
        })
      );

      const verifyCredentialMock = jest.fn();
      verifyCredentialMock.mockReturnValue(true);
      PassportVerifierWithExpiration.prototype.verifyCredential =
        verifyCredentialMock;

      await act(async () => {
        renderWrapped(
          <Twitter handle={handle} verificationError={() => {}} canVerify />,
          store
        );
      });

      // TO BE ENABLE
      // should not be a problem with REACT_APP_PASSPORT_IAM_URL properly set
      // expect(screen.queryByText("Verified")).toBeInTheDocument();
    });

    test("should not show the badge if the verified account is different from the current one in the form", async () => {
      const store = setupStore();
      const handle = "my-twitter-handle";
      const vc = buildVerifiableCredential("Twitter", handle);
      vc.issuer = IAM_SERVER;

      store.dispatch({
        type: "METADATA_SAVED",
        metadata: buildFormMetadata({
          projectTwitter: "another-twitter-account",
        }),
      });

      store.dispatch(
        credentialsSaved({
          twitter: vc,
        })
      );

      const verifyCredentialMock = jest.fn();
      verifyCredentialMock.mockReturnValue(true);
      PassportVerifierWithExpiration.prototype.verifyCredential =
        verifyCredentialMock;

      await act(async () => {
        renderWrapped(
          <Twitter handle={handle} verificationError={() => {}} canVerify />,
          store
        );
      });

      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    });

    test("should not show the badge if the `issuer did` does not match the `IAM did`", async () => {
      const store = setupStore();
      const handle = "my-twitter-handle";
      const vc = buildVerifiableCredential("Twitter", handle);
      vc.issuer =
        "did:key:rAndomDiDRanDOmdidrAndomDiDRanDOmdidrAndomDiDRanDOmdid";

      store.dispatch({
        type: "METADATA_SAVED",
        metadata: buildFormMetadata({
          projectTwitter: handle,
        }),
      });

      store.dispatch(
        credentialsSaved({
          twitter: vc,
        })
      );

      const verifyCredentialMock = jest.fn();
      verifyCredentialMock.mockReturnValue(true);
      PassportVerifierWithExpiration.prototype.verifyCredential =
        verifyCredentialMock;

      await act(async () => {
        renderWrapped(
          <Twitter handle={handle} verificationError={() => {}} canVerify />,
          store
        );
      });

      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    });
    test("should not show the badge if the credential is invalid", async () => {
      const store = setupStore();
      const handle = "my-twitter-handle";
      const vc = buildVerifiableCredential("Twitter", handle);
      vc.issuer = IAM_SERVER;

      store.dispatch({
        type: "METADATA_SAVED",
        metadata: buildFormMetadata({
          projectTwitter: handle,
        }),
      });

      store.dispatch(
        credentialsSaved({
          twitter: vc,
        })
      );

      await act(async () => {
        renderWrapped(
          <Twitter handle={handle} verificationError={() => {}} canVerify />,
          store
        );
      });

      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    });
  });
});
