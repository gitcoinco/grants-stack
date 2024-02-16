import useSWR, { Cache, SWRResponse, useSWRConfig } from "swr";
import { ChainId } from "common";
import { __deprecated_fetchFromIPFS } from "./utils";
import { createTimestamp } from "../discovery/utils/createRoundsStatusFilter";
import { RoundGetRound, RoundsQueryVariables, useDataLayer } from "data-layer";

export const useRounds = (
  variables: RoundsQueryVariables,
  chainIds: ChainId[]
): SWRResponse<RoundGetRound[]> => {
  const { cache, mutate } = useSWRConfig();
  const dataLayer = useDataLayer();

  const prewarmSwrCacheWithRoundsMetadata = async (
    rounds: RoundGetRound[]
  ): Promise<void> => {
    const roundsWithUncachedMetadata = rounds.filter(
      (round) =>
        cache.get(`@"metadata","${round.roundMetadataCid}",`) === undefined
    );

    const uncachedMetadata = await Promise.all(
      roundsWithUncachedMetadata.map(async (round) => {
        const cid = round.roundMetadataCid;
        const metadata = await __deprecated_fetchFromIPFS(cid);
        return [cid, metadata];
      })
    );

    for (const [cid, metadata] of uncachedMetadata) {
      mutate(["metadata", cid], metadata);
    }

    if (roundsWithUncachedMetadata.length > 0) {
      // clear rounds cache
      mutate(["rounds", chainIds, variables]);
    }
  };

  const query = useSWR(
    // Cache requests on chainIds and variables as keys (when these are the
    // same, cache will be used instead of new requests)
    ["rounds", chainIds, variables],
    async () => {
      const { rounds } = await dataLayer.getRounds({
        ...variables,
        // We need to overfetch these because many will be filtered out from the
        // metadata.roundType === "public" The `first` param in the arguments
        // will instead be used last to limit the results returned
        first: 100,
        chainIds,
      });

      await prewarmSwrCacheWithRoundsMetadata(rounds);

      return rounds;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
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

export const filterRounds = (
  cache: Cache<{ roundType: string }>,
  rounds?: RoundGetRound[]
) => {
  return rounds?.filter((round) => {
    // Get the round metadata
    const metadata = cache.get(`@"metadata","${round.roundMetadataCid}",`);
    if (metadata?.data?.roundType === "public") {
      return true;
    }
  });
};
