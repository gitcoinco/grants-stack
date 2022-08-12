import { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { datadogRum } from "@datadog/browser-rum";
import { debounce } from "ts-debounce";
import Button, { ButtonVariants } from "../base/Button";
import { global } from "../../global";
import { fetchVerifiableCredential } from "./identity/credentials";
import { ProviderID } from "../../types";
import { RootState } from "../../reducers";

const providerId: ProviderID = "ClearTextTwitter";

const parseHandle = (provider: string) =>
  provider.replace(/ClearTextTwitter#(.*)$/, "$1");

export default function Twitter({
  handle,
  verificationComplete,
  verificationError,
}: {
  handle: string;
  verificationComplete: (event: VerifiableCredential) => void;
  verificationError: (providerError?: string) => void;
}) {
  const [complete, setComplete] = useState(false);
  const props = useSelector(
    (state: RootState) => ({
      account: state.web3.account,
    }),
    shallowEqual
  );

  const signer = global.web3Provider?.getSigner();
  // Open Twitter authUrl in centered window
  function openTwitterOAuthUrl(url: string): void {
    const width = 600;
    const height = 800;
    // eslint-disable-next-line no-restricted-globals
    const left = screen.width / 2 - width / 2;
    // eslint-disable-next-line no-restricted-globals
    const top = screen.height / 2 - height / 2;

    // Pass data to the page via props
    window.open(
      url,
      "_blank",
      // eslint-disable-next-line max-len
      `toolbar=no, location=no, directories=no, status=no, menubar=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  }

  // Fetch Twitter OAuth2 url from the IAM procedure
  async function handleFetchTwitterOAuth(): Promise<void> {
    // Fetch data from external API
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
    // open new window for authUrl
    openTwitterOAuthUrl(data.authUrl);
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
          type: providerId,
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
              setComplete(true);
              verificationComplete(verified.credential);
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
          datadogRum.addError(error, { provider: providerId });
        })
        .finally(() => {});
    }
  }

  // attach and destroy a BroadcastChannel to handle the message
  useEffect(() => {
    // open the channel
    const channel = new BroadcastChannel("twitter_oauth_channel");
    // event handler will listen for messages from the child (debounced to avoid multiple submissions)
    channel.onmessage = debounce((event: MessageEvent) => {
      listenForRedirect(event.data);
    });

    return () => {
      channel.close();
    };
  });

  if (complete) {
    return (
      <div className="flex ml-8">
        <img src="./icons/shield.svg" alt="Shield Logo" className="h-6 mr-2" />
        <p className="text-green-text font-normal">Verified</p>
      </div>
    );
  }

  return (
    <div>
      <Button
        styles={["ml-8 w-auto"]}
        variant={ButtonVariants.secondary}
        onClick={() => handleFetchTwitterOAuth()}
      >
        Verify
      </Button>
    </div>
  );
}
