import useSWRImmutable from "swr/immutable";
import { zeroAddress } from "viem";
import { ChainId } from "common";
import { getConfig } from "common/src/config";

/* TODO: Rename some of the types to hungarian-style notation once we have shared types between indexer and frontends */
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
  roundId: string;
  chainId: ChainId;
  potentialVotes: {
    projectId: string;
    roundId: string;
    applicationId: string;
    token: string;
    voter: string;
    grantAddress: string;
    amount: bigint;
  }[];
};

type JSONValue = string | number | boolean | bigint | JSONObject | JSONValue[];

interface JSONObject {
  [x: string]: JSONValue;
}

const config = getConfig();

function getMatchingEstimates(
  params: UseMatchingEstimatesParams
): Promise<MatchingEstimateResult[]> {
  if (config.explorer.disableEstimates) {
    throw new Error("matching estimate temporarily disabled");
  }

  const replacer = (_key: string, value: JSONValue) =>
    typeof value === "bigint" ? value.toString() : value;

  /* The indexer wants just the application id number, not the whole application */
  const fixedApplicationId = params.potentialVotes.map((vote) => ({
    ...vote,
    applicationId: vote.applicationId.includes("-")
      ? vote.applicationId.split("-")[1]
      : vote.applicationId,
  }));

  return fetch(
    `${process.env.REACT_APP_ALLO_API_URL}/api/v1/chains/${params.chainId}/rounds/${params.roundId}/estimate`,
    {
      headers: {
        Accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({ potentialVotes: fixedApplicationId }, replacer),
      method: "POST",
    }
  ).then((r) => r.json());
}

/**
 * Fetches matching estimates for the given rounds, given potential votes, as an array
 * For a single round, pass in an array with a single element
 */
export function useMatchingEstimates(params: UseMatchingEstimatesParams[]) {
  const shouldFetch = params.every((param) => param.roundId !== zeroAddress);
  return useSWRImmutable(shouldFetch ? params : null, (params) =>
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
    .reduce((acc, b) => acc + b, 0);
}
