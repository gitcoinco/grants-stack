import useSWR from "swr";
import { useParams } from "react-router";
import { isAddress } from "viem";
import {
  ChainId,
  graphql_fetch,
} from "../../round-manager/src/features/api/utils";

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
        chainId
      );
    }
  );

  const payouts = data?.data?.payoutStrategies?.payouts || [];

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
