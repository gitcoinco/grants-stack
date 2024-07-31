import { Signer } from "@ethersproject/abstract-signer";
import { Network, Web3Provider } from "@ethersproject/providers";
import { useEffect, useState } from "react";
import { useParams as useRouterParams } from "react-router";
import z from "zod";
import { Round } from "data-layer";
import { getAlloVersion, getConfig } from "./config";
import moment from "moment-timezone";
import { getChainById } from "@gitcoin/gitcoin-chain-data";

export * from "./icons";
export * from "./markdown";
export * from "./allo/common";
export * from "./allo/application";
export * from "./payoutTokens";

export * from "./services/passport/passportCredentials";
export { PassportVerifierWithExpiration } from "./services/passport/credentialVerifier";
export * from "@gitcoin/gitcoin-chain-data";

export function useParams<T extends Record<string, string> = never>() {
  return useRouterParams<T>() as T;
}

export enum PassportState {
  NOT_CONNECTED,
  INVALID_PASSPORT,
  SCORE_AVAILABLE,
  LOADING,
  ERROR,
  INVALID_RESPONSE,
}

const PassportEvidenceSchema = z.object({
  type: z.string().nullish(),
  rawScore: z.coerce.number(),
  threshold: z.union([z.string().nullish(), z.coerce.number()]),
});

export type PassportResponse = z.infer<typeof PassportResponseSchema>;

export const PassportResponseSchema = z.object({
  address: z.string().nullish(),
  score: z.string().nullish(),
  status: z.string().nullish(),
  evidence: PassportEvidenceSchema.nullish(),
  error: z.string().nullish(),
  detail: z.string().nullish(),
});

/**
 * Endpoint used to fetch the passport score for a given address
 *
 * @param address
 * @param communityId
 * @param apiKey
 * @returns
 */
export const fetchPassport = (
  address: string,
  communityId: string,
  apiKey: string
): Promise<Response> => {
  const url = `${process.env.REACT_APP_PASSPORT_API_ENDPOINT}/registry/score/${communityId}/${address}`;
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
};

/**
 * Endpoint used to submit user's passport score for given communityId
 *
 * @param address string
 * @param communityId string
 * @param apiKey string
 * @returns
 */
export const submitPassport = (
  address: string,
  communityId: string,
  apiKey: string
): Promise<Response> => {
  const url = `${process.env.REACT_APP_PASSPORT_API_ENDPOINT}/registry/submit-passport`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": `${apiKey}`,
    },
    body: JSON.stringify({
      address: address,
      community: communityId,
      signature: "",
      nonce: "",
    }),
  });
};

export const submitPassportLite = (
  address: string,
  apiKey: string
): Promise<Response> => {
  const url = `${process.env.REACT_APP_PASSPORT_API_ENDPOINT}/passport/analysis/${address}`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": `${apiKey}`,
    },
  });
};

export function classNames(...classes: (false | null | undefined | string)[]) {
  return classes.filter(Boolean).join(" ");
}

export type Payout = {
  id: string;
  amount: string;
  grantee: string;
  projectId: string;
  txnHash: string;
  token: string;
  version: string;
  createdAt: string;
};

export function formatDateWithOrdinal(date: Date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  } as const;

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedDate = formatter.format(date);

  const dayOfMonth = date.getDate();
  const pluralRules = new Intl.PluralRules("en-US", { type: "ordinal" });
  const suffix = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th",
    many: "",
    zero: "",
  }[pluralRules.select(dayOfMonth)];

  return `${formattedDate.replace(
    dayOfMonth.toString(),
    `${dayOfMonth}${suffix}`
  )}`;
}

export enum VerifiedCredentialState {
  VALID,
  INVALID,
  PENDING,
}

enum ApplicationStatus {
  PENDING = "0",
  APPROVED = "1",
  REJECTED = "2",
  CANCELLED = "3",
}

export const convertStatusToText = (
  applicationStatus: string | number
): string => {
  // Ensure the applicationStatus is a string
  applicationStatus = applicationStatus.toString();

  switch (applicationStatus) {
    case ApplicationStatus.CANCELLED:
      return "CANCELLED";
    case ApplicationStatus.REJECTED:
      return "REJECTED";
    case ApplicationStatus.APPROVED:
      return "APPROVED";
    case ApplicationStatus.PENDING:
    default:
      return "PENDING";
  }
};

/** Returns true if the current javascript context is running inside a Jest test  */
export const isJestRunning = () => process.env["JEST_WORKER_ID"] !== undefined;

export const padSingleDigitNumberWithZero = (i: number): string =>
  i < 10 ? "0" + i : i.toString();

export const formatUTCDateAsISOString = (date: Date): string => {
  // @ts-expect-error remove when DG support is merged
  if (isNaN(date)) {
    return "";
  }
  const isoString = date.toISOString();
  return isoString.slice(0, 10).replace(/-/g, "/");
};

export const getUTCTime = (date: Date): string => {
  const utcTime = [
    padSingleDigitNumberWithZero(date.getUTCHours()),
    padSingleDigitNumberWithZero(date.getUTCMinutes()),
  ];

  return utcTime.join(":") + " UTC";
};

export const getUTCDate = (date: Date): string => {
  const utcDate = [
    padSingleDigitNumberWithZero(date.getUTCFullYear()),
    padSingleDigitNumberWithZero(date.getUTCMonth() + 1),
    padSingleDigitNumberWithZero(date.getUTCDate()),
  ];

  return utcDate.join("/");
};

export const getUTCDateTime = (date: Date): string => {
  return `${getUTCDate(date)} ${getUTCTime(date)}`;
};

export const formatLocalDateAsISOString = (date: Date): string => {
  // @ts-expect-error remove when DG support is merged
  if (isNaN(date)) {
    return "";
  }
  const localString = getLocalDate(date);
  return localString;
};

export function getTimezoneName() {
  const today = new Date();
  const userTimeZone = moment.tz.guess();
  const formattedDate = moment(today).tz(userTimeZone).format("z");

  return formattedDate;
}

export const getLocalTime = (date: Date): string => {
  const localTime = [
    padSingleDigitNumberWithZero(date.getHours()),
    padSingleDigitNumberWithZero(date.getMinutes()),
  ];

  return localTime.join(":") + " " + getTimezoneName();
};

export const getLocalDate = (date: Date): string => {
  const localDate = [
    padSingleDigitNumberWithZero(date.getFullYear()),
    padSingleDigitNumberWithZero(date.getMonth() + 1),
    padSingleDigitNumberWithZero(date.getDate()),
  ];

  return localDate.join("/");
};

export const getLocalDateTime = (date: Date): string => {
  return `${getLocalDate(date)} ${getLocalTime(date)}`;
};

export const useTokenPrice = (tokenId: string | undefined) => {
  const [tokenPrice, setTokenPrice] = useState<number>();
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const tokenPriceEndpoint = `https://api.redstone.finance/prices?symbol=${tokenId}&provider=redstone&limit=1`;
    fetch(tokenPriceEndpoint)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          return resp.text().then((text) => {
            throw new Error(text);
          });
        }
      })
      .then((data) => {
        if (data && data.length > 0) {
          setTokenPrice(data[0].value);
        } else {
          throw new Error(`No data returned: ${data.toString()}`);
        }
      })
      .catch((err) => {
        console.log("error fetching token price", {
          tokenId,
          tokenPriceEndpoint,
          err,
        });
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tokenId]);

  if (!tokenId) {
    return {
      data: 0,
      error,
      loading,
    };
  }

  return {
    data: tokenPrice,
    error,
    loading,
  };
};

export async function getTokenPrice(tokenId: string) {
  const tokenPriceEndpoint = `https://api.redstone.finance/prices?symbol=${tokenId}&provider=redstone&limit=1`;
  const resp = await fetch(tokenPriceEndpoint);
  const data = await resp.json();
  return data[0].value;
}

export const ROUND_PAYOUT_MERKLE_OLD = "MERKLE";
export const ROUND_PAYOUT_MERKLE = "allov1.QF";
export const ROUND_PAYOUT_DIRECT = "allov1.Direct";
export const ROUND_PAYOUT_DIRECT_OLD = "DIRECT";
export type RoundPayoutType =
  | typeof ROUND_PAYOUT_DIRECT_OLD
  | typeof ROUND_PAYOUT_MERKLE_OLD;
export type RoundPayoutTypeNew =
  | "allov1.Direct"
  | "allov1.QF"
  | "allov2.DonationVotingMerkleDistributionDirectTransferStrategy"
  | "allov2.MicroGrantsStrategy"
  | "allov2.MicroGrantsHatsStrategy"
  | "allov2.SQFSuperFluidStrategy"
  | "allov2.MicroGrantsGovStrategy"
  | "allov2.DirectGrantsSimpleStrategy"
  | "allov2.DirectGrantsLiteStrategy"
  | "allov2.DirectAllocationStrategy"
  | ""; // This is to handle the cases where the strategyName is not set in a round, mostly spam rounds

export type RoundStrategyType = "QuadraticFunding" | "DirectGrants";

export function getRoundStrategyTitle(name: string) {
  switch (getRoundStrategyType(name)) {
    case "DirectGrants":
      return "Direct Grants";

    case "QuadraticFunding":
      return "Quadratic Funding";
  }
}

export function getRoundStrategyType(name: string): RoundStrategyType {
  switch (name) {
    case "allov1.Direct":
    case "DIRECT":
    case "allov2.DirectGrantsSimpleStrategy":
    case "allov2.DirectGrantsLiteStrategy":
      return "DirectGrants";

    case "allov1.QF":
    case "MERKLE":
    case "allov2.DonationVotingMerkleDistributionDirectTransferStrategy":
      return "QuadraticFunding";

    default:
      throw new Error(`Unknown round strategy type: ${name}`);
  }
}

export type RoundVisibilityType = "public" | "private";

export { AlloError, AlloOperation } from "./allo/allo";
export type { Allo } from "./allo/allo";
export { AlloV1 } from "./allo/backends/allo-v1";
export { AlloV2 } from "./allo/backends/allo-v2";
export { createWaitForIndexerSyncTo } from "./allo/indexer";
export type { WaitUntilIndexerSynced } from "./allo/indexer";
export { createPinataIpfsUploader } from "./allo/ipfs";
export { AlloContext, AlloProvider, useAllo } from "./allo/react";
export {
  createEthersTransactionSender,
  createMockTransactionSender,
  createViemTransactionSender,
  decodeEventFromReceipt,
  sendRawTransaction,
  sendTransaction,
} from "./allo/transaction-sender";

export type AnyJson =
  | boolean
  | number
  | string
  | null
  | undefined
  | JsonArray
  | JsonMap;
interface JsonMap {
  [key: string]: AnyJson;
}
type JsonArray = Array<AnyJson>;
export interface Web3Instance {
  /**
   * Currently selected address in ETH format i.e 0x...
   */
  address: string;
  /**
   * Chain ID & name of the currently connected network
   */
  chain: {
    id: number;
    name: string;
    network: Network;
  };
  provider: Web3Provider;
  signer?: Signer;
}

export function roundToPassportIdAndKeyMap(round: Round): {
  communityId: string;
  apiKey: string;
} {
  const chainId = round?.chainId;
  switch (chainId) {
    case 43114: // Arbitrum
      return {
        communityId: getConfig().passport.passportAvalancheCommunityId,
        apiKey: getConfig().passport.passportAvalancheAPIKey,
      };
    default:
      return {
        communityId: getConfig().passport.passportCommunityId,
        apiKey: getConfig().passport.passportAPIKey,
      };
  }
}

export function roundToPassportURLMap(round: Round) {
  const chainId = round.chainId;
  switch (chainId) {
    case 43114: // Arbitrum
      return "https://passport.gitcoin.co/#/dashboard/avalanche";
    default:
      return "https://passport.gitcoin.co";
  }
}

export * from "./allo/transaction-builder";

/**
 * Fetch the correct transaction block explorer link for the provided web3 network
 *
 * @param chainId - The chain ID of the blockchain
 * @param txHash - The transaction hash
 * @returns the transaction block explorer URL for the provided transaction hash and network
 */
export const getTxBlockExplorerLink = (chainId: number, txHash: string) => {
  return getChainById(chainId)?.blockExplorer + "tx/" + txHash;
};

export function isChainIdSupported(chainId: number) {
  if (chainId === 424 && getAlloVersion() === "allo-v2") {
    return false;
  }
  return getChainById(chainId) !== undefined;
}

const gg20Rounds = [
  //GG20 rounds
  { roundId: "23", chainId: 42161 }, // Hackathon Alumni
  { roundId: "24", chainId: 42161 }, // ENS
  { roundId: "25", chainId: 42161 }, // dApps & Apps
  { roundId: "26", chainId: 42161 }, // WEB3 Infrastructure
  { roundId: "27", chainId: 42161 }, // Developer Tooling
  { roundId: "28", chainId: 42161 }, // Hypercerts Ecosystem
  { roundId: "29", chainId: 42161 }, // Climate Solutions
  { roundId: "31", chainId: 42161 }, // Open Civics
  { roundId: "36", chainId: 42161 }, // Regenerative Land Projects
  { roundId: "39", chainId: 42161 }, // DeSci
  { roundId: "9", chainId: 10 }, // Token Engineering Commons (TEC)
];

export function isGG20Round(roundId: string, chainId: number) {
  return gg20Rounds.some((r) => r.roundId === roundId && r.chainId === chainId);
}

export function isLitUnavailable(chainId: number) {
  return [
    4201, // LUKSO_TESTNET,
    42, // LUKSO,
    713715, // SEI_DEVNET,
    1329, // SEI_MAINNET,
  ].includes(chainId);
}

export * from "./chains";
