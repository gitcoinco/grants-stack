import { Tooltip } from "@chakra-ui/react";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { BroadcastChannel } from "broadcast-channel";
import { debounce } from "ts-debounce";
import { global } from "../../global";
import { RootState } from "../../reducers";
import { CredentialProvider } from "../../types";
import Button, { ButtonVariants } from "../base/Button";
import { fetchVerifiableCredential } from "./identity/credentials";
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

  const validTwitterCredential: boolean = useValidateCredential(
    props.vc,
    CredentialProvider.Twitter,
    props.formMetaData.projectTwitter
  );

  const { signer } = global;

  // Fetch Twitter OAuth2 url from the IAM procedure
  async function handleFetchTwitterOAuth(): Promise<void> {
    const width = 600;
    const height = 800;
    // eslint-disable-next-line no-restricted-globals
    const left = screen.width / 2 - width / 2;
    // eslint-disable-next-line no-restricted-globals
    const top = screen.height / 2 - height / 2;

    const authWindow = window.open(
      "",
      "_blank",
      // eslint-disable-next-line max-len
      `toolbar=no, location=no, directories=no, status=no, menubar=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );

    // Fetch data from external API
    try {
      const res = await fetch(
        `${process.env.REACT_APP_PASSPORT_PROCEDURE_URL?.replace(
          /\/*?$/,
          ""
        )}/twitter/generateAuthUrl`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            callback: process.env.REACT_APP_PUBLIC_PASSPORT_TWITTER_CALLBACK,
          }),
        }
      );
      const data = await res.json();

      if (authWindow) {
        authWindow.location = data.authUrl;
      }
    } catch (error) {
      verificationError(
        "Couldn't connect to Twitter. Please try verifying again"
      );
      datadogLogs.logger.error("Twitter verification failed");
      datadogRum.addError(error, { provider: CredentialProvider.Twitter });
    }
  }

  // Listener to watch for oauth redirect response on other windows (on the same host)
  function listenForRedirect(e: {
    target: string;
    data: { code: string; state: string };
  }) {
    // when receiving twitter oauth response from a spawned child run fetchVerifiableCredential
    if (e.target === "twitter") {
      // pull data from message
      const queryCode = e.data.code;
      const queryState = e.data.state;

      fetchVerifiableCredential(
        process.env.REACT_APP_PASSPORT_IAM_URL || "",
        {
          type: CredentialProvider.Twitter,
          version: "0.0.0",
          address: props.account || "",
          proofs: {
            code: queryCode, // provided by twitter as query params in the redirect
            sessionKey: queryState,
          },
        },
        signer as { signMessage: (message: string) => Promise<string> }
      )
        .then(
          async (verified: {
            credential: VerifiableCredential;
          }): Promise<void> => {
            const { provider } = verified.credential.credentialSubject;
            if (
              provider &&
              parseHandle(provider).toLocaleLowerCase() ===
                handle.toLocaleLowerCase()
            ) {
              dispatch(
                credentialsSaved({
                  twitter: verified.credential!,
                })
              );
              verificationError();
            } else {
              verificationError(
                `${handle} does not match ${parseHandle(
                  provider ?? ""
                )}, the account you authenticated with.`
              );
            }
          }
        )
        .catch((error) => {
          verificationError(
            "Couldn't connect to Twitter. Please try verifying again"
          );
          datadogLogs.logger.error("Twitter verification failed", error);
          datadogRum.addError(error, { provider: CredentialProvider.Twitter });
        })
        .finally(() => {});
    }
  }

  // attach and destroy a BroadcastChannel to handle the message
  useEffect(() => {
    // open the channel
    const channel = new BroadcastChannel("twitter_oauth_channel");
    // event handler will listen for messages from the child (debounced to avoid multiple submissions)
    channel.onmessage = debounce(
      (event: { target: string; data: { code: string; state: string } }) => {
        listenForRedirect(event);
      }
    );

    return () => {
      channel.close();
    };
  });

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
