// --- Methods
import { Tooltip } from "@chakra-ui/react";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { BroadcastChannel } from "broadcast-channel";
import { debounce } from "ts-debounce";
import { global } from "../../global";
// --- Identity tools
import { RootState } from "../../reducers";
import { CredentialProvider } from "../../types";
import Button, { ButtonVariants } from "../base/Button";
import { ClientType, fetchVerifiableCredential } from "./identity";
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
      formMetaData: state.projectForm.metadata,
      vc: state.projectForm?.credentials?.github,
    }),
    shallowEqual
  );
  const { signer } = global;
  const dispatch = useDispatch();
  const [GHID, setGHID] = useState("");

  const validGithubCredential: boolean = useValidateCredential(
    props.vc,
    CredentialProvider.Github,
    props.formMetaData.projectGithub
  );

  // Fetch Github OAuth2 url from the IAM procedure
  async function handleFetchGithubOAuth(): Promise<void> {
    const width = 600;
    const height = 800;
    // eslint-disable-next-line no-restricted-globals
    const left = screen.width / 2 - width / 2;
    // eslint-disable-next-line no-restricted-globals
    const top = screen.height / 2 - height / 2;
    // Generate a new state string and store it in the compoenents state so that we can
    // verify it later
    const ghID = `github-${generateUID(10)}`;

    setGHID(ghID);

    // Pass data to the page via props
    const authWindow = window.open(
      "",
      "_blank",
      // eslint-disable-next-line max-len
      `toolbar=no, location=no, directories=no, status=no, menubar=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );

    // eslint-disable-next-line max-len
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_PUBLIC_GITHUB_CALLBACK}&state=${ghID}`;

    if (authWindow) {
      authWindow.location = githubUrl;
    }
  }

  // Listener to watch for oauth redirect response on other windows (on the same host)
  function listenForRedirect(e: {
    target: string;
    data: { code: string; state: string };
  }) {
    // when receiving github oauth response from a spawned child run fetchVerifiableCredential
    if (e.target === "github") {
      // pull data from message
      const { code } = e.data;

      if (GHID !== e.data.state) {
        return;
      }

      // fetch and store credential
      fetchVerifiableCredential(
        process.env.REACT_APP_PASSPORT_IAM_URL || "",
        {
          type: CredentialProvider.Github,
          version: "0.0.0",
          address: props.account || "",
          org,
          requestedClient: ClientType.GrantHub,
          proofs: {
            code, // provided by github as query params in the redirect
          },
        },
        signer as { signMessage: (message: string) => Promise<string> }
      )
        .then(async (verified: { credential: any }): Promise<void> => {
          dispatch(
            credentialsSaved({
              github: verified.credential!,
            })
          );
          verificationError();
        })
        .catch((error) => {
          let errorMessage;
          // adding a console log here to help debug
          console.log("Error on Github verification", error);
          // todo: this is a fix for only this specific error, we should handle this better
          if (props.formMetaData.projectGithub) {
            // eslint-disable-next-line max-len
            errorMessage = `There was an issue with verifying your GitHub account, please try again.`;
          } else {
            errorMessage =
              // eslint-disable-next-line max-len
              "There was an issue with verifying your GitHub account, please try again.";
          }
          verificationError(errorMessage);
          datadogRum.addError(error, { provider: CredentialProvider.Github });
          datadogLogs.logger.error("GitHub verification failed", error);
        });
    }
  }

  // attach and destroy a BroadcastChannel to handle the message
  useEffect(() => {
    // open the channel
    const channel = new BroadcastChannel("github_oauth_channel");
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

  if (validGithubCredential) {
    return <VerifiedBadge />;
  }
  return (
    <div hidden={!canVerify} className={canVerify ? "flex flex-row mt-4" : ""}>
      <Button
        disabled={org?.length === 0}
        styles={["ml-8 w-auto mt-12"]}
        variant={ButtonVariants.secondary}
        onClick={() => handleFetchGithubOAuth()}
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
