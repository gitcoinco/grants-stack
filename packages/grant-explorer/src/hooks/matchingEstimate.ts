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
  chainId: ChainId;
  potentialVotes: {
    contributor: string;
    recipient: string;
    amount: bigint;
    token: string;
  }[];
};

type JSONValue = string | number | boolean | bigint | JSONObject | JSONValue[];

interface JSONObject {
  [x: string]: JSONValue;
}

function getMatchingEstimates(
  params: UseMatchingEstimatesParams
): Promise<MatchingEstimateResult[]> {
  const replacer = (_key: string, value: JSONValue) =>
    typeof value === "bigint" ? value.toString() : value;

  return fetch(
    `${process.env.REACT_APP_ALLO_API_URL}/api/v1/chains/${params.chainId}/rounds/${params.roundId}/estimate`,
    {
      headers: {
        Accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({ potentialVotes: params.potentialVotes }, replacer),
      method: "POST",
    }
  ).then((r) => r.json());
}

/**
 * Fetches matching estimates for the given rounds, given potential votes, as an array
 * For a single round, pass in an array with a single element
 */
export function useMatchingEstimates(params: UseMatchingEstimatesParams[]) {
  return useSWR(params, (params) =>
    Promise.all(params.map((params) => getMatchingEstimates(params)))
  );
}

export function matchingEstimatesToText(
  matchingEstimates?: MatchingEstimateResult[][]
) {
  return matchingEstimates
    ?.flat()
    .map((est) => est.differenceInUSD ?? 0)
    .filter((diff) => diff > 0)
    .reduce((acc, b) => acc + b, 0)
    .toFixed(2);
}
