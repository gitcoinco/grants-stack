// --- Methods
import { Tooltip } from "@chakra-ui/react";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { global } from "../../global";
// --- Identity tools
import { RootState } from "../../reducers";
import { CredentialProvider } from "../../types";
import Button, { ButtonVariants } from "../base/Button";
import {
  openOauthWindow,
  ClientType,
  fetchVerifiableCredential,
  VerificationError,
  VerifiableCredential,
} from "./identity/credentials";
import { credentialsSaved } from "../../actions/projectForm";
import useValidateCredential from "../../hooks/useValidateCredential";
import VerifiedBadge from "../badges/VerifiedBadge";

function generateUID(length: number) {
  return window
    .btoa(
      Array.from(window.crypto.getRandomValues(new Uint8Array(length * 2)))
        .map((b) => String.fromCharCode(b))
        .join("")
    )
    .replace(/[+/]/g, "")
    .substring(0, length);
}

export default function Github({
  org,
  verificationError,
  canVerify,
}: {
  org: string;
  verificationError: (providerError?: string) => void;
  canVerify: boolean;
}) {
  const props = useSelector(
    (state: RootState) => ({
      account: state.web3.account,
      formMetadata: state.projectForm.metadata,
      verifiableCredential: state.projectForm?.credentials?.github,
    }),
    shallowEqual
  );
  const { signer } = global;
  const dispatch = useDispatch();

  const { isValid: validCredential } = useValidateCredential(
    props.verifiableCredential,
    props.formMetadata.projectGithub
  );

  async function handleVerify(): Promise<void> {
    // Fetch data from external API
    try {
      const ghID = `github-${generateUID(10)}`;
      // eslint-disable-next-line max-len
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_PUBLIC_GITHUB_CALLBACK}&state=${ghID}`;

      const result = await openOauthWindow(
        authUrl,
        "github_oauth_channel",
        "github",
        ghID
      );

      const verified: { credential: VerifiableCredential } =
        await fetchVerifiableCredential(
          process.env.REACT_APP_PASSPORT_IAM_URL || "",
          {
            type: CredentialProvider.Github,
            version: "0.0.0",
            address: props.account || "",
            org,
            requestedClient: ClientType.GrantHub,
            proofs: {
              code: result.code, // provided by GitHub as query params in the redirect
            },
          },
          signer as { signMessage: (message: string) => Promise<string> }
        );

      dispatch(
        credentialsSaved({
          github: verified.credential!,
        })
      );

      verificationError();
    } catch (error) {
      if (error instanceof VerificationError) {
        verificationError(error.message);
      } else {
        console.error(error);
        let errorMessage;
        if (props.formMetadata.projectGithub) {
          // eslint-disable-next-line max-len
          errorMessage = `There was an issue with verifying your GitHub account, please make sure your Github account is a public member of the Github Organization and try again.`;
        } else {
          // eslint-disable-next-line max-len
          errorMessage = `There was an issue with verifying your GitHub account, please try again.`;
        }
        verificationError(errorMessage);
        datadogLogs.logger.error("Github verification failed");
        datadogRum.addError(error, { provider: CredentialProvider.Github });
      }
    }
  }

  if (validCredential) {
    return <VerifiedBadge />;
  }

  return (
    <div hidden={!canVerify} className={canVerify ? "flex flex-row mt-4" : ""}>
      <Button
        disabled={org?.length === 0}
        styles={["ml-8 w-auto mt-12"]}
        variant={ButtonVariants.secondary}
        onClick={() => handleVerify()}
      >
        Verify
      </Button>
      <Tooltip
        className="shrink"
        bg="purple.900"
        hasArrow
        label="Optional: Verify your project so that our grant program partners know your project is trustworthy.
        You can also verify your project later, but doing so will incur additional gas fees."
      >
        <QuestionMarkCircleIcon className="w-6 h-6  mt-14" color="gray" />
      </Tooltip>
    </div>
  );
}
