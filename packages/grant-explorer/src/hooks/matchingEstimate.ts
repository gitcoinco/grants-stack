import useSWR from "swr";
import { Address } from "viem";
import { ChainId } from "common";

export type MatchingEstimateResult = {
  totalReceived: string;
  contributionsCount: string;
  sumOfSqrt: string;
  capOverflow: string;
  matchedWithoutCap: string;
  matched: string;
  difference: bigint;
  differenceInUSD: number;
  roundId: string;
  chainId: number;
  recipient: string;
};

type UseMatchingEstimatesParams = {
  roundId: Address;
  chainid: ChainId;
  potentialVotes: {
    contributor: string;
    recipient: string;
    amount: bigint;
    token: string;
  }[];
};

function getMatchingEstimates(
  params: UseMatchingEstimatesParams
): Promise<MatchingEstimateResult[]> {
  // eslint-disable-next-line
  const replacer = (key: any, value: any) =>
    typeof value === "bigint" ? value.toString() : value;

  return fetch(
    `${process.env.REACT_APP_ALLO_API_URL}/api/v1/chains/${params.chainid}/rounds/${params.roundId}/estimate`,
    {
      headers: {
        accept: "*/*",
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: JSON.stringify({ potentialVotes: params.potentialVotes }, replacer),
      method: "POST",
    }
  ).then((r) => r.json());
}

/**
 * Fetches matching estimates for the given round, given potential votes, as an array
 * For a single round, pass in an array with a single element
 * Returns amounts in the round token -> needs to be converted to USD usually based on the round token price */
export function useMatchingEstimates(params: UseMatchingEstimatesParams[]) {
  return useSWR(params, (params) =>
    Promise.all(params.map((params) => getMatchingEstimates(params)))
  );
}
