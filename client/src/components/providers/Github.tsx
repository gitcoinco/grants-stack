// --- Methods
import { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { datadogRum } from "@datadog/browser-rum";
import { debounce } from "ts-debounce";
import { global } from "../../global";
// --- Identity tools
import { ProviderID } from "../../types";
import { fetchVerifiableCredential } from "./identity";
import { RootState } from "../../reducers";
import Button, { ButtonVariants } from "../base/Button";

// Each provider is recognised by its ID
const providerId: ProviderID = "ClearTextGithubOrg";

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
  verificationComplete,
  verificationError,
}: {
  org: string;
  verificationComplete: (event: VerifiableCredential) => void;
  verificationError: (providerError?: string) => void;
}) {
  const props = useSelector(
    (state: RootState) => ({
      account: state.web3.account,
    }),
    shallowEqual
  );
  const signer = global.web3Provider?.getSigner();
  const [GHID, setGHID] = useState("");
  const [complete, setComplete] = useState(false);

  // Open Github authUrl in centered window
  function openGithubOAuthUrl(url: string): void {
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

  // Fetch Github OAuth2 url from the IAM procedure
  async function handleFetchGithubOAuth(): Promise<void> {
    // Generate a new state string and store it in the compoenents state so that we can
    // verify it later
    const ghID = `github-${generateUID(10)}`;
    setGHID(ghID);

    // eslint-disable-next-line max-len
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_PUBLIC_GITHUB_CALLBACK}&state=${ghID}`;
    openGithubOAuthUrl(githubUrl);
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
          type: providerId,
          version: "0.0.0",
          address: props.account || "",
          org,
          proofs: {
            code, // provided by github as query params in the redirect
          },
        },
        signer as { signMessage: (message: string) => Promise<string> }
      )
        .then(async (verified: { credential: any }): Promise<void> => {
          setComplete(true);
          verificationComplete(verified.credential);
          verificationError();
        })
        .catch((error) => {
          verificationError(
            "Couldn't connect to Github. Please try verifying again"
          );
          datadogRum.addError(error, { provider: providerId });
        });
    }
  }

  // attach and destroy a BroadcastChannel to handle the message
  useEffect(() => {
    // open the channel
    const channel = new BroadcastChannel("github_oauth_channel");
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
        disabled={org?.length === 0}
        styles={["ml-8 w-auto"]}
        variant={ButtonVariants.secondary}
        onClick={() => handleFetchGithubOAuth()}
      >
        Verify
      </Button>
    </div>
  );
}
