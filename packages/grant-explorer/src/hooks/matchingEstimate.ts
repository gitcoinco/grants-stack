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
  difference: string;
};

type UseMatchingEstimatesParams = {
  roundId: Address;
  chainid: ChainId;
  potentialVotes: { contributor: string; recipient: string; amount: bigint }[];
};

function getMatchingEstimates(params: UseMatchingEstimatesParams) {
  // eslint-disable-next-line
  const replacer = (key: any, value: any) =>
    typeof value === "bigint" ? value.toString() : value;

  return fetch(
    `https://indexer-development.fly.dev/api/v1/chains/${params.chainid}/rounds/${params.roundId}/estimate`,
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

export function useMatchingEstimates(params: UseMatchingEstimatesParams[]) {
  return useSWR(params, (params) => {
    return Promise.all(params.map((params) => getMatchingEstimates(params)));
  });
}
