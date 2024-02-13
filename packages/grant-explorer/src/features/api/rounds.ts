import useSWR, { useSWRConfig, Cache, SWRResponse } from "swr";
import { ChainId, RoundPayoutType } from "common";
import { __deprecated_RoundMetadata } from "./round";
import { MetadataPointer } from "./types";
import { __deprecated_fetchFromIPFS } from "./utils";
import { createTimestamp } from "../discovery/utils/createRoundsStatusFilter";
import { useDataLayer } from "data-layer";

export type __deprecated_RoundOverview = {
  id: string;
  chainId: ChainId;
  createdAt: string;
  roundMetaPtr: MetadataPointer;
  applicationMetaPtr: MetadataPointer;
  applicationsStartTime: string;
  applicationsEndTime: string;
  roundStartTime: string;
  roundEndTime: string;
  matchAmount: string;
  token: string;
  roundMetadata?: __deprecated_RoundMetadata;
  projects?: { id: string }[];
  payoutStrategy: {
    id: string;
    strategyName: RoundPayoutType;
  };
};

export type __deprecated_RoundsQueryVariables = {
  first?: number;
  orderBy?:
    | "createdAt"
    | "matchAmount"
    | "roundStartTime"
    | "roundEndTime"
    | "applicationsStartTime"
    | "applicationsEndTime";
  orderDirection?: "asc" | "desc";
  where?: {
    and: [
      { or: __deprecated_TimestampVariables[] },
      { payoutStrategy_?: { or: { strategyName: string }[] } },
    ];
  };
};

export type __deprecated_TimestampVariables = {
  applicationsStartTime_lte?: string;
  applicationsEndTime_gt?: string;
  applicationsEndTime_lt?: string;
  applicationsEndTime?: string;
  applicationsEndTime_gte?: string;
  roundStartTime_lt?: string;
  roundStartTime_gt?: string;
  roundEndTime_gt?: string;
  roundEndTime_lt?: string;
};

export const useRounds = (
  variables: __deprecated_RoundsQueryVariables,
  chainIds: ChainId[]
): SWRResponse<__deprecated_RoundOverview[]> => {
  const { cache, mutate } = useSWRConfig();
  const dataLayer = useDataLayer();

  const prewarmSwrCacheWithRoundsMetadata = async (
    rounds: __deprecated_RoundOverview[]
  ): Promise<void> => {
    const roundsWithUncachedMetadata = rounds.filter(
      (round) =>
        cache.get(`@"metadata","${round.roundMetaPtr.pointer}",`) === undefined
    );

    const uncachedMetadata = await Promise.all(
      roundsWithUncachedMetadata.map(async (round) => {
        const cid = round.roundMetaPtr.pointer;
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
      const { rounds } = await dataLayer.getLegacyRounds({
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

export function filterRoundsWithProjects(rounds: __deprecated_RoundOverview[]) {
  /*
0 projects + application period is still open: show 
0 projects + application period has closed: hide
  */
  const currentTimestamp = createTimestamp();
  return rounds.filter((round) => {
    if (round.applicationsEndTime > currentTimestamp) return true;
    return round?.projects?.length;
  });
}

export const filterRounds = (
  cache: Cache<{ roundType: string }>,
  rounds?: __deprecated_RoundOverview[]
) => {
  return rounds?.filter((round) => {
    // Get the round metadata
    const metadata = cache.get(`@"metadata","${round.roundMetaPtr.pointer}",`);
    if (metadata?.data?.roundType === "public") {
      return true;
    }
  });
};

// Will only make a request if metadata doesn't exist yet
export function useMetadata(cid: string) {
  return useSWR(["metadata", cid], () => __deprecated_fetchFromIPFS(cid));
}

/* 
Search round metadata
Builds a results object and filters round name on a search query
*/
export function useSearchRounds(query = "") {
  const { cache } = useSWRConfig();

  const results: __deprecated_RoundMetadata[] = [];
  // Cache is actually a Map but says forEach doesn't exist
  (cache as Map<string, { data: __deprecated_RoundMetadata }>).forEach(
    ({ data }, key) => {
      if (nameContains(data?.name, key)) {
        results.push(data);
      }
    }
  );

  function nameContains(name: string, key: string) {
    return (
      key.startsWith(`@"metadata"`) &&
      name?.toLowerCase().includes(query.toLowerCase())
    );
  }

  return useSWR(["search", { results, query }], () => results);
}
