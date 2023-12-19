import useSWR, { useSWRConfig, Cache, SWRResponse } from "swr";
import { ChainId, RoundPayoutType } from "common";
import { __deprecated_RoundMetadata } from "./round";
import { MetadataPointer } from "./types";
import { __deprecated_fetchFromIPFS, useDebugMode } from "./utils";
import { createTimestamp } from "../discovery/utils/createRoundsStatusFilter";
import { useDataLayer } from "data-layer";

const validRounds = [
  "0x35c9d05558da3a3f3cddbf34a8e364e59b857004", // "Metacamp Onda 2023 FINAL
  "0x984e29dcb4286c2d9cbaa2c238afdd8a191eefbc", // Gitcoin Citizens Round #1
  "0x4195cd3cd76cc13faeb94fdad66911b4e0996f38", // Greenpill Q2 2023
].map((a) => a.toLowerCase());

const invalidRounds = [
  "0xde272b1a1efaefab2fd168c02b8cf0e3b10680ef", // Meg hello

  // https://github.com/gitcoinco/grants-stack/issues/2569
  "0x7c1104c39e09e7c6114f3d4e30a180a714deac7d",
  "0x79715bf10dab457e06020ec41efae3484cff59dc",
  "0x4632ea15ba3c1a7e072996fb316efefb8280381b",
  "0xfe36ff9c59788a6a9ad7a979f459d69372dad0e6",
  "0xa7149a073db99cd9ac267daf0c4f7767e50acf3f",
  "0x4abc6f3322158bcec933f18998709322de7152c2",
  "0xae53557089a1d771cd5cebeaf6accbe8f064ff4c",
  "0xee3ed186939af2c55d33d242c4588426e368c8d0",
  "0x8011e814439b44aa340bc3373df06233f45e3202",
  "0xf3cd7429e863a39a9ecab60adc4676c1934076f2",
  "0x88fc9d6695bedd34bbbe4ea0e2510573200713c7",
  "0xae18f327ce481a7316d28a625d4c378c1f8b03a2",
  "0x9b3b1e7edf9c5eea07fb3c7270220be1c3fea111",
  "0x4c19261ff6e5736a2677a06741bf1e68995e7c95",
  "0x1ebac14c3b3e539b0c1334415c70a923eb7c736f",
  "0x3979611e7ca6db8f45b4a768079a88d9138622c1",
  "0x0b1e3459cdadc52fca8977cede34f28bc298e3df",
  "0x1427a0e71a222b0229a910dc72da01f8f04c7441",
  "0xc25994667632d55a8e3dae88737e36f496600434",
  "0x21d264139d66dd281dcb0177bbdca5ceeb71ad69",
  "0x822742805c0596e883aba99ba2f3117e8c49b94a",
].map((a) => a.toLowerCase());

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
  const isDebugModeEnabled = useDebugMode();
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
      const { rounds } = await dataLayer.query({
        type: "legacy-rounds",
        ...variables,
        // We need to overfetch these because many will be filtered out from the
        // metadata.roundType === "public" The `first` param in the arguments
        // will instead be used last to limit the results returned
        first: 100,
        chainIds,
      });

      await prewarmSwrCacheWithRoundsMetadata(rounds);

      return rounds;
    }
  );

  const data = (
    isDebugModeEnabled ? query.data : filterRounds(cache, query.data)
  )
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
    if (validRounds.includes(round.id.toLowerCase())) {
      return true;
    }

    if (invalidRounds.includes(round.id.toLowerCase())) {
      return false;
    }

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
