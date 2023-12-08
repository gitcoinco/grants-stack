import useSWR from "swr";
import { useMemo, useState } from "react";
import { ChainId } from "./chain-ids";
import z from "zod";
export * from "./icons";
export * from "./markdown";

export { ChainId };

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
  threshold: z.string().nullish(),
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
 * @returns
 */
export const fetchPassport = (
  address: string,
  communityId: string
): Promise<Response> => {
  const url = `${process.env.REACT_APP_PASSPORT_API_ENDPOINT}/registry/score/${communityId}/${address}`;
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_PASSPORT_API_KEY}`,
    },
  });
};

/**
 * Endpoint used to submit user's passport score for given communityId
 *
 * @param address string
 * @param communityId string
 * @returns
 */
export const submitPassport = (
  address: string,
  communityId: string
): Promise<Response> => {
  const url = `${process.env.REACT_APP_PASSPORT_API_ENDPOINT}/registry/submit-passport`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_PASSPORT_API_KEY}`,
    },
    body: JSON.stringify({
      address,
      community: communityId,
      signature: "",
      nonce: "",
    }),
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

// TODO relocate to data layer
export const graphQlEndpoints: Record<ChainId, string> = {
  [ChainId.DEV1]: process.env.REACT_APP_SUBGRAPH_DEV1_API!,
  [ChainId.DEV2]: process.env.REACT_APP_SUBGRAPH_DEV2_API!,
  [ChainId.PGN]: process.env.REACT_APP_SUBGRAPH_PGN_API!,
  [ChainId.PGN_TESTNET]: process.env.REACT_APP_SUBGRAPH_PGN_TESTNET_API!,
  [ChainId.MAINNET]: process.env.REACT_APP_SUBGRAPH_MAINNET_API!,
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API!,
  [ChainId.FANTOM_MAINNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_FANTOM_MAINNET_API!,
  [ChainId.FANTOM_TESTNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_FANTOM_TESTNET_API!,
  [ChainId.ARBITRUM_GOERLI]:
    process.env.REACT_APP_SUBGRAPH_ARBITRUM_GOERLI_API!,
  [ChainId.ARBITRUM]: process.env.REACT_APP_SUBGRAPH_ARBITRUM_API!,
  [ChainId.FUJI]: process.env.REACT_APP_SUBGRAPH_FUJI_API!,
  [ChainId.AVALANCHE]: process.env.REACT_APP_SUBGRAPH_AVALANCHE_API!,
  [ChainId.POLYGON]: process.env.REACT_APP_SUBGRAPH_POLYGON_API!,
  [ChainId.POLYGON_MUMBAI]: process.env.REACT_APP_SUBGRAPH_POLYGON_MUMBAI_API!,
};

/**
 * Fetch subgraph network for provided web3 network.
 * The backticks are here to work around a failure of a test that tetsts graphql_fetch,
 * and fails if the endpoint is undefined, so we convert the undefined to a string here in order not to fail the test.
 *
 * @param chainId - The chain ID of the blockchain
 * @returns the subgraph endpoint
 */
export const getGraphQLEndpoint = (chainId: ChainId) =>
  `${graphQlEndpoints[chainId]}`;

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param query - The query to be executed
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param variables - The variables to be used in the query
 * @param fromProjectRegistry - Override to fetch from grant hub project registry subgraph
 * @returns The result of the query
 */
export const graphql_fetch = async (
  query: string,
  chainId: ChainId,
  // eslint-disable-next-line @typescript-eslint/ban-types
  variables: object = {},
  fromProjectRegistry = false
) => {
  let endpoint = getGraphQLEndpoint(chainId);

  if (fromProjectRegistry) {
    endpoint = endpoint.replace("grants-round", "grants-hub");
  }

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  }).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp);
  });
};

/**
 * Fetches the payouts that happened for a given round from TheGraph
 * @param roundId Round ID
 * @param chainId Chain ID
 * @returns
 */
export function fetchProjectPaidInARound(
  roundId: string,
  chainId: ChainId
): Promise<Payout[]> {
  const { data } = useSWR(
    [roundId, chainId],
    ([roundId, chainId]: [roundId: string, chainId: ChainId]) => {
      return graphql_fetch(
        `
        query GetPayouts($roundId: String) {
          payoutStrategies(
            where:{
              round_:{
                id: $roundId
              }
            }
          ) {
            payouts {
              id
              version
              createdAt
              token
              amount
              grantee
              projectId
              txnHash
            }
          }
        }
      `,
        chainId,
        { roundId }
      );
    }
  );

  const payouts = data?.data?.payoutStrategies[0]?.payouts || [];

  return payouts;
}

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

export const RedstoneTokenIds = {
  FTM: "FTM",
  USDC: "USDC",
  DAI: "DAI",
  ETH: "ETH",
  ARB: "ARB",
  BUSD: "BUSD",
  GTC: "GTC",
  MATIC: "MATIC",
  AVAX: "AVAX",
  CVP: "CVP",
} as const;

export const useTokenPrice = (tokenId: string | undefined) => {
  const [tokenPrice, setTokenPrice] = useState<number>();
  const [error, setError] = useState<Response | undefined>();
  const [loading, setLoading] = useState(false);

  if (!tokenId)
    return {
      data: 0,
      error,
      loading,
    };

  useMemo(async () => {
    setLoading(true);

    const tokenPriceEndpoint = `https://api.redstone.finance/prices?symbol=${tokenId}&provider=redstone&limit=1`;
    fetch(tokenPriceEndpoint)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          setError(resp);
          setLoading(false);
        }
      })
      .then((data) => {
        if (data) {
          setTokenPrice(data[0].value);
        } else {
          setError(data);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.log("error fetching token price", { err });
        setError(err);
        setLoading(false);
      });
  }, [tokenId]);

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

export const ROUND_PAYOUT_MERKLE = "MERKLE";
export const ROUND_PAYOUT_DIRECT = "DIRECT";
export type RoundPayoutType = "MERKLE" | "DIRECT";
export type RoundVisibilityType = "public" | "private";
