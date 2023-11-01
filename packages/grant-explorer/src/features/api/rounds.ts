import useSWR, { useSWRConfig, Cache } from "swr";
import { ChainId, RoundPayoutType, graphql_fetch } from "common";
import { RoundMetadata } from "./round";
import { MetadataPointer } from "./types";
import { fetchFromIPFS, useDebugMode } from "./utils";
import { ethers } from "ethers";
import { allChains } from "../../app/chainConfig";
import { tryParseChainIdToEnum } from "common/src/chains";
import { isPresent } from "ts-is-present";
import { useState } from "react";

const validRounds = [
  "0x35c9d05558da3a3f3cddbf34a8e364e59b857004", // "Metacamp Onda 2023 FINAL
  "0x984e29dcb4286c2d9cbaa2c238afdd8a191eefbc", // Gitcoin Citizens Round #1
  "0x4195cd3cd76cc13faeb94fdad66911b4e0996f38", // Greenpill Q2 2023
];

const invalidRounds = ["0xde272b1a1efaefab2fd168c02b8cf0e3b10680ef"]; // Meg hello

export type RoundOverview = {
  id: string;
  chainId: string;
  createdAt: string;
  roundMetaPtr: MetadataPointer;
  applicationMetaPtr: MetadataPointer;
  applicationsStartTime: string;
  applicationsEndTime: string;
  roundStartTime: string;
  roundEndTime: string;
  matchAmount: string;
  token: string;
  roundMetadata?: RoundMetadata;
  projects?: [];
  payoutStrategy: {
    id: string;
    strategyName: RoundPayoutType;
  };
};

export type RoundsVariables = {
  first?: number;
  orderBy?:
    | "createdAt"
    | "matchAmount"
    | "roundStartTime"
    | "roundEndTime"
    | "applicationsStartTime"
    | "applicationsEndTime";
  orderDirection?: "asc" | "desc";
  where?: TimestampVariables & {
    payoutStrategy_?: { strategyName_in: string[] };
    and?: (TimestampVariables & { or?: TimestampVariables[] })[];
  };
};
type TimestampVariables = {
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

export const getActiveChainIds = (): ChainId[] =>
  allChains
    .map((chain) => chain.id)
    .map(tryParseChainIdToEnum)
    .filter(isPresent);

const ROUNDS_QUERY = `
query GetRounds(
  $first: Int, 
  $orderBy: String,
  $orderDirection: String,
  $where: Round_filter,
  $currentTimestamp: String
  ) {
    rounds(first: $first,
      orderBy: $orderBy,
      orderDirection: $orderDirection,
      where: $where
    ) {
      id
      roundMetaPtr {
        protocol
        pointer
      }
      applicationsStartTime
      applicationsEndTime
      roundStartTime
      roundEndTime
      matchAmount
      token
      payoutStrategy {
        id
        strategyName
      }
      projects(where:{
        status: 1
      }) {
        id
      }
    }
}
`;

const NOW_IN_SECONDS = Date.now() / 1000;
const ONE_YEAR_IN_SECONDS = 3600 * 24 * 365;
const INFINITE_TIMESTAMP = ethers.constants.MaxUint256.toString();
export const createTimestamp = (timestamp = 0) =>
  Math.floor(NOW_IN_SECONDS + timestamp).toString();

export function useRoundsTakingApplications() {
  // Only create the timestamp once, otherwise the SWR cache will be unique on every hook render
  const [currentTimestamp] = useState(createTimestamp());
  return useRounds({
    where: {
      and: [
        { applicationsStartTime_lte: currentTimestamp },
        {
          or: [
            { applicationsEndTime: INFINITE_TIMESTAMP },
            { applicationsEndTime_gte: currentTimestamp },
          ],
        },
      ],
    },
  });
}

// What filters for active rounds?
export function useActiveRounds() {
  const [currentTimestamp] = useState(createTimestamp());
  const [futureTimestamp] = useState(createTimestamp(ONE_YEAR_IN_SECONDS * 1));
  return useRounds({
    orderBy: "roundEndTime",
    orderDirection: "desc",
    where: {
      // Round must have started and not ended yet
      roundStartTime_lt: currentTimestamp,
      roundEndTime_gt: currentTimestamp,
      roundEndTime_lt: futureTimestamp,
    },
  });
}

export function useRoundsEndingSoon() {
  const [currentTimestamp] = useState(createTimestamp());
  return useRounds({
    orderBy: "roundEndTime",
    orderDirection: "asc",
    where: {
      roundEndTime_gt: currentTimestamp,
    },
  });
}

//
export function useRounds(
  variables: RoundsVariables,
  chainIds: ChainId[] = getActiveChainIds()
) {
  const { cache } = useSWRConfig();
  const debugModeEnabled = useDebugMode();

  const defaultVariables: RoundsVariables = {
    first: 3 * 12,
  };

  const mergedVariables = { ...defaultVariables, ...variables };

  const query = useSWR(
    // Cache requests on chainIds and variables as keys (when these are the same, cache will be used instead of new requests)
    ["rounds", chainIds, variables],
    () =>
      Promise.all(
        chainIds.flatMap((chainId) => {
          return graphql_fetch(ROUNDS_QUERY, chainId, mergedVariables).then(
            (r) =>
              r.data?.rounds?.map((round: RoundOverview) => ({
                ...round,
                chainId,
              })) ?? []
          );
        })
      )
        .then((res) => res.flat())
        .then(cleanRoundData)
        // We need to do another sort because of results from many chains
        .then((rounds) => sortRounds(rounds, mergedVariables))
        // Limit results
        .then((rounds) => rounds.slice(0, mergedVariables.first))
  );

  return {
    ...query,
    data: debugModeEnabled ? query.data : filterRounds(cache, query.data),
  };
}

function sortRounds(
  rounds: RoundOverview[],
  { orderBy = "roundEndTime", orderDirection = "asc" }: RoundsVariables
) {
  const dir = { asc: 1, desc: -1 };
  return rounds.sort((a, b) =>
    a[orderBy] > b[orderBy] ? dir[orderDirection] : -dir[orderDirection]
  );
}
/* 
Some timestamps are in milliseconds and others in overflowed values (115792089237316195423570985008687907853269984665640564039457584007913129639935)
See this query: https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet/graphql?query=query+%7B%0A+++rounds%28first%3A+3%2C%0A++++++orderBy%3A+roundEndTime%2C%0A++++++orderDirection%3A+asc%0A++++%29+%7B%0A++++++id%0A++++++roundEndTime%0A+++++%0A++++%7D%0A%7D
*/
function cleanRoundData(rounds: RoundOverview[]) {
  const timestampKeys = [
    "roundStartTime",
    "roundEndTime",
    "applicationsStartTime",
    "applicationsEndTime",
  ] as const;
  return rounds.map((round) => ({
    ...round,
    ...timestampKeys.reduce(
      (acc, key) => ({
        ...acc,
        [key]:
          round[key].length > 10 // This timestamp is in milliseconds, convert to seconds
            ? Math.round(Number(round.roundEndTime) / 1000).toString()
            : round.roundEndTime,
      }),
      {}
    ),
  }));
}

function filterRounds(
  cache: Cache<{ roundType: string }>,
  rounds?: RoundOverview[]
) {
  return rounds?.filter((round) => {
    // Get the round metadata
    const metadata = cache.get(`@"metadata","${round.roundMetaPtr.pointer}",`);
    if (metadata?.data?.roundType === "public") {
      return true;
    }

    if (validRounds.includes(round.id)) {
      return true;
    }

    if (invalidRounds.includes(round.id)) {
      return false;
    }
    return true;
  });
}

/* 
Fetch all rounds in the background and get all the metadata.
This enables two things:
- Rendering of Round Cards can start after the graphql request is done (doesn't need to wait for all metadata)
- We can search for Round metadata in the cached results (see useSearchRounds)

*/
export function usePrefetchRoundsMetadata() {
  const chainIds = getActiveChainIds();
  const [currentTimestamp] = useState(createTimestamp());
  const { mutate } = useSWRConfig();

  return useSWR(
    ["rounds-list", { chainIds }],
    () => {
      return getActiveChainIds().flatMap((chainId) => {
        // Only fetch metadata pointer to lower response size
        return graphql_fetch(
          `
      query GetAllRounds($currentTimestamp: String) {
        rounds(where: {
          roundStartTime_lt: $currentTimestamp
          roundEndTime_gt: $currentTimestamp
        }) {
          id
          roundMetaPtr {
            protocol
            pointer
          }
        }
      }
      `,
          chainId,
          { currentTimestamp }
        )
          .then((r) => r.data?.rounds ?? [])
          .then(async (rounds) => {
            for (const round of rounds) {
              const cid = round.roundMetaPtr.pointer;
              // Fetch metadata for each round and update cache
              mutate(["metadata", cid], await fetchFromIPFS(cid));
            }
          });
      });
    },
    { keepPreviousData: true }
  );
}
// Will only make a request if metadata doesn't exist yet
export function useMetadata(cid: string) {
  return useSWR(["metadata", cid], () => fetchFromIPFS(cid));
}

/* 
Search round metadata
Builds a results object and filters round name on a search query
*/
export function useSearchRounds(query = "") {
  const { cache } = useSWRConfig();

  const results: RoundMetadata[] = [];
  // Cache is actually a Map but says forEach doesn't exist
  (cache as Map<string, { data: RoundMetadata }>).forEach(({ data }, key) => {
    if (nameContains(data?.name, key)) {
      results.push(data);
    }
  });

  function nameContains(name: string, key: string) {
    return (
      key.startsWith(`@"metadata"`) &&
      name?.toLowerCase().includes(query.toLowerCase())
    );
  }

  return useSWR(["search", { results, query }], () => results);
}
