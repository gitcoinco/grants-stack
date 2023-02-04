// --- Types
import { datadogLogs } from "@datadog/browser-logs";
import {
  RequestPayload,
  IssuedChallenge,
  VerifiableCredentialRecord,
} from "@gitcoinco/passport-sdk-types";

// --- Node/Browser http req library
import axios from "axios";

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
