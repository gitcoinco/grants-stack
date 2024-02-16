import useSWR, { SWRResponse } from "swr";
import { ChainId } from "common";
import { createTimestamp } from "../discovery/utils/createRoundsStatusFilter";
import { RoundGetRound, RoundsQueryVariables, useDataLayer } from "data-layer";

export const useRounds = (
  variables: RoundsQueryVariables,
  chainIds: ChainId[]
): SWRResponse<RoundGetRound[]> => {
  const dataLayer = useDataLayer();

  const query = useSWR(
    // Cache requests on chainIds and variables as keys (when these are the
    // same, cache will be used instead of new requests)
    ["rounds", chainIds, variables],
    async () => {
      const { rounds } = await dataLayer.getRounds({
        ...variables,
        first: 100,
        chainIds,
      });

      return rounds;
    }
  );

  const data = query.data
    // Limit final results returned
    ?.slice(0, variables.first ?? query.data?.length);

  return { ...query, data };
};

export function filterRoundsWithProjects(rounds: RoundGetRound[]) {
  /*
0 projects + application period is still open: show
0 projects + application period has closed: hide
  */
  const currentTimestamp = createTimestamp();
  return rounds.filter((round) => {
    if (round.applicationsEndTime > currentTimestamp) return true;
    return round?.applications?.length;
  });
}

export const filterOutPrivateRounds = (rounds: RoundGetRound[]) => {
  return rounds.filter((round) => round.roundMetadata.roundType === "public");
};
