import useSWR from "swr";
import { useParams } from "react-router";
import { isAddress } from "viem";

export enum ChainId {
  MAINNET = 1,
  GOERLI_CHAIN_ID = 5,
  OPTIMISM_MAINNET_CHAIN_ID = 10,
  FANTOM_MAINNET_CHAIN_ID = 250,
  FANTOM_TESTNET_CHAIN_ID = 4002,
}

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

type UsePassportHook = {
  /** Passport for the given address and communityId */
  passport: PassportResponse | undefined;
  /** State of the hook
   * Handles loading, error and other states */
  state: PassportState;
  /** Error during fetching of passport score */
  error: Response | undefined;
  /** Re-submits the address for passport scoring
   * Promise resolves when the submission is successful, NOT when the score is updated */
  recalculateScore: () => Promise<Response>;
  /**
   * Refreshes the score without resubmitting for scoring */
  refreshScore: () => Promise<void>;
};

export function usePassport(
  address: string,
  communityId: string
): UsePassportHook {
  const { data, error, mutate } = useSWR<PassportResponse>(
    [address, communityId],
    ([address, communityId]: [address: string, communityId: string]) =>
      fetchPassport(address, communityId).then((res) => res.json())
  );

  return {
    error,
    state: PassportState.NOT_CONNECTED,
    refreshScore: async () => {
      await mutate();
    },
    recalculateScore: () => submitPassport(address, communityId),
    passport: data,
  };
}

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

const getGraphQLEndpoint = async (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.MAINNET:
      return `${process.env.REACT_APP_SUBGRAPH_MAINNET_API}`;

    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`;

    case ChainId.FANTOM_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_FANTOM_MAINNET_API}`;

    case ChainId.FANTOM_TESTNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_FANTOM_TESTNET_API}`;

    case ChainId.GOERLI_CHAIN_ID:
    default:
      return `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`;
  }
};

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
  let endpoint = await getGraphQLEndpoint(chainId);

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
  const { data, error, mutate } = useSWR(
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

/** Returns the current round id extracted from the current  route
 * If there's no id parameter, or it isn't an Ethereum address, logs a warning to sentry.
 * Types the return as string to avoid superfluous undefined-checks. If this hook is used on a page that doesn't contain a
 * round id, we don't care about that page breaking either way.
 * @return current round id extracted from route parameters
 * */
export function useRoundId() {
  const { id: roundId } = useParams();

  /* Check if the ID is an Ethereum address */
  if (!isAddress(roundId ?? "")) {
    console.warn(
      "id extracted from url in useRoundId hook isn't a valid address. Check usage."
    );
  }
  return roundId as string;
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

export * from "./icons";

export * from "./markdown";
export enum VerifiedCredentialState {
  VALID,
  INVALID,
  PENDING,
}
