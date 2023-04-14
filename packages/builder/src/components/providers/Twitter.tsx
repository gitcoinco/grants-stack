import { Tooltip } from "@chakra-ui/react";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { global } from "../../global";
import { RootState } from "../../reducers";
import { CredentialProvider } from "../../types";
import Button, { ButtonVariants } from "../base/Button";
import {
  createVerifiableCredential,
  VerificationError,
} from "./identity/credentials";
import useValidateCredential from "../../hooks/useValidateCredential";
import { credentialsSaved } from "../../actions/projectForm";
import VerifiedBadge from "../badges/VerifiedBadge";

const parseHandle = (provider: string) =>
  provider.replace(/ClearTextTwitter#(.*)$/, "$1");

export default function Twitter({
  handle,
  verificationError,
  canVerify,
}: {
  handle: string;
  verificationError: (providerError?: string) => void;
  canVerify: boolean;
}) {
  const dispatch = useDispatch();
  const props = useSelector((state: RootState) => {
    const twitterCredential = state.projectForm?.credentials?.twitter;
    return {
      account: state.web3.account,
      formMetaData: state.projectForm.metadata,
      vc: twitterCredential,
    };
  }, shallowEqual);

  const { isValid: validTwitterCredential } = useValidateCredential(
    props.vc,
    CredentialProvider.Twitter,
    props.formMetaData.projectTwitter
  );

  const { signer } = global;

  // Fetch Twitter OAuth2 url from the IAM procedure
  async function handleFetchTwitterOAuth(): Promise<void> {
    // Fetch data from external API
    try {
      const credential = await createVerifiableCredential(
        `${process.env.REACT_APP_PASSPORT_PROCEDURE_URL}/twitter/generateAuthUrl`,
        process.env.REACT_APP_PUBLIC_PASSPORT_TWITTER_CALLBACK!,
        "twitter_oauth_channel",
        CredentialProvider.Twitter,
        props.account ?? "",
        signer
      );

      const { provider } = credential.credentialSubject;

      if (
        provider &&
        parseHandle(provider).toLocaleLowerCase() === handle.toLocaleLowerCase()
      ) {
        dispatch(
          credentialsSaved({
            twitter: credential!,
          })
        );
        verificationError();
      } else {
        throw new VerificationError(
          `${handle} does not match ${parseHandle(
            provider ?? ""
          )}, the account you authenticated with.`
        );
      }
    } catch (error) {
      if (error instanceof VerificationError) {
        verificationError(error.message);
      } else {
        verificationError(
          "Couldn't connect to Twitter. Please try verifying again"
        );
        datadogLogs.logger.error("Twitter verification failed");
        datadogRum.addError(error, { provider: CredentialProvider.Twitter });
      }
    }
  }

  if (validTwitterCredential) {
    return <VerifiedBadge />;
  }

  return (
    <div hidden={!canVerify} className={canVerify ? "flex flex-row mt-4" : ""}>
      <Button
        disabled={handle?.length === 0}
        styles={["ml-8 w-auto mt-12"]}
        variant={ButtonVariants.secondary}
        onClick={() => handleFetchTwitterOAuth()}
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
