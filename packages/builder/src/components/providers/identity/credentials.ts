// --- Node/Browser http req library
import axios from "axios";
import { datadogLogs } from "@datadog/browser-logs";
import {
  RequestPayload,
  IssuedChallenge,
  VerifiableCredentialRecord,
} from "@gitcoinco/passport-sdk-types";
import { BroadcastChannel } from "broadcast-channel";
import { debounce } from "ts-debounce";

export type { VerifiableCredential } from "@gitcoinco/passport-sdk-types";

// Keeping track of the hashing mechanism (algo + content)
export const VERSION = "v0.0.0";

// Fetch a verifiable challenge credential
export const fetchChallengeCredential = async (
  iamUrl: string,
  payload: RequestPayload
): Promise<IssuedChallenge> => {
  // fetch challenge as a credential from API that fits the version, address and type (this credential has a short ttl)

  let response;
  try {
    response = await axios.post(
      `${iamUrl.replace(/\/*?$/, "")}/v${payload.version}/challenge`,
      {
        payload: {
          address: payload.address,
          type: payload.type,
        },
      }
    );
  } catch (error) {
    datadogLogs.logger.error(`Error fetching challenge credential ${error}`);
  }
  return {
    challenge: response?.data.credential,
  } as IssuedChallenge;
};

export enum ClientType {
  GrantHub,
}

export type GHOrgRequestPayload = RequestPayload & {
  requestedClient?: ClientType.GrantHub;
  org?: string;
};

// Fetch a verifiableCredential
export const fetchVerifiableCredential = async (
  iamUrl: string,
  payload: GHOrgRequestPayload,
  signer: { signMessage: (message: string) => Promise<string> } | undefined
): Promise<VerifiableCredentialRecord> => {
  // must provide signature for message
  if (!signer) {
    throw new Error("Unable to sign message without a signer");
  }

  // first pull a challenge that can be signed by the user
  const { challenge } = await fetchChallengeCredential(iamUrl, payload);

  // sign the challenge provided by the IAM
  const signature = challenge.credentialSubject.challenge
    ? (
        await signer.signMessage(challenge.credentialSubject.challenge)
      ).toString()
    : "";

  // must provide signature for message
  if (!signature) {
    throw new Error("Unable to sign message");
  }

  // pass the signature as part of the proofs obj
  // eslint-disable-next-line no-param-reassign
  payload.proofs = { ...payload.proofs, ...{ signature } };

  // fetch a credential from the API that fits the version, payload and passes the signature message challenge

  let response;
  try {
    response = await axios.post(
      `${iamUrl.replace(/\/*?$/, "")}/v${payload.version}/verify`,
      {
        payload,
        challenge,
      }
    );
  } catch (error) {
    datadogLogs.logger.error(`Error fetching verifiable credential ${error}`);
  }

  // return everything that was used to create the credential (along with the credential)
  return {
    signature,
    challenge,
    record: response?.data.record,
    credential: response?.data.credential,
  } as VerifiableCredentialRecord;
};

export class VerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VerificationError";
  }
}

export async function fetchAuthUrl(
  url: string,
  callbackUrl: string
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      callback: callbackUrl,
    }),
  });

  const data = await res.json();

  return data.authUrl;
}

export type OAuthResult = {
  code: string;
  state: string;
};

export function openOauthWindow(
  url: string,
  broadcastChannelName: string
): Promise<OAuthResult> {
  const width = 600;
  const height = 800;
  // eslint-disable-next-line no-restricted-globals
  const left = screen.width / 2 - width / 2;
  // eslint-disable-next-line no-restricted-globals
  const top = screen.height / 2 - height / 2;

  const authWindow = window.open(
    url,
    "_blank",
    // eslint-disable-next-line max-len
    `toolbar=no, location=no, directories=no, status=no, menubar=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
  );

  if (!authWindow) {
    throw new Error("Failed to open pop up");
  }

  return new Promise((resolve, reject) => {
    const channel = new BroadcastChannel(broadcastChannelName);

    // timeout after 5 minutes
    const timeout = setTimeout(() => {
      reject(new VerificationError("Authorization timed out"));
    }, 1000 * 60 * 5);

    channel.onmessage = debounce(
      (event: {
        target: string;
        data: { error: string | null; code: string; state: string };
      }) => {
        clearTimeout(timeout);

        if (event.data.error) {
          reject(new VerificationError(event.data.error));
        }

        resolve({
          code: event.data.code,
          state: event.data.state,
        });
      }
    );
  });
}

export async function createVerifiableCredentialFromOAuth(
  authUrlGenerator: string,
  callbackUrl: string,
  broadcastChannelName: string
): Promise<OAuthResult> {
  const authUrl = await fetchAuthUrl(authUrlGenerator, callbackUrl);

  return openOauthWindow(authUrl, broadcastChannelName);
}
