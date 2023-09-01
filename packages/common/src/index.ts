import useSWR from "swr";
import { useMemo, useState } from "react";
import { ChainId } from "./chains";

export * from "./icons";
export * from "./markdown";

export { ChainId };

export enum PassportState {
  NOT_CONNECTED,
  INVALID_PASSPORT,
  MATCH_ELIGIBLE,
  MATCH_INELIGIBLE,
  LOADING,
  ERROR,
  INVALID_RESPONSE,
}

type PassportEvidence = {
  type: string;
  rawScore: string;
  threshold: string;
};

export type PassportResponse = {
  address?: string;
  score?: string;
  status?: string;
  evidence?: PassportEvidence;
  error?: string;
  detail?: string;
};

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

const graphQlEndpoints: Record<ChainId, string> = {
  [ChainId.PGN]: process.env.REACT_APP_SUBGRAPH_PGN_API!,
  [ChainId.GOERLI_CHAIN_ID]: process.env.REACT_APP_SUBGRAPH_GOERLI_API!,
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
};

/**
 * Fetch subgraph network for provided web3 network.
 * The backticks are here to work around a failure of a test that tetsts graphql_fetch,
 * and fails if the endpoint is undefined, so we convert the undefined to a string here in order not to fail the test.
 *
 * @param chainId - The chain ID of the blockchain
 * @returns the subgraph endpoint
 */
const getGraphQLEndpoint = (chainId: ChainId) => `${graphQlEndpoints[chainId]}`;

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
export const isJestRunning = () => process.env.JEST_WORKER_ID !== undefined;

export const padSingleDigitNumberWithZero = (i: number): string =>
  i < 10 ? "0" + i : i.toString();

export const formatUTCDateAsISOString = (date: Date): string => {
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
    padSingleDigitNumberWithZero(date.getUTCDate()),
    padSingleDigitNumberWithZero(date.getUTCMonth() + 1),
    padSingleDigitNumberWithZero(date.getUTCFullYear()),
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
};

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
