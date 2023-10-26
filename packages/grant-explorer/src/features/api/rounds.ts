import useSWR, { useSWRConfig, Cache } from "swr";
import { ChainId, RoundPayoutType, graphql_fetch } from "common";
import { RoundMetadata } from "./round";
import { MetadataPointer } from "./types";
import { fetchFromIPFS, useDebugMode } from "./utils";
import { ethers } from "ethers";

const validRounds = [
  "0x35c9d05558da3a3f3cddbf34a8e364e59b857004",
  "0x984e29dcb4286c2d9cbaa2c238afdd8a191eefbc",
  "0x4195cd3cd76cc13faeb94fdad66911b4e0996f38",
];

const invalidRounds = ["0xde272b1a1efaefab2fd168c02b8cf0e3b10680ef"];

export type RoundOverview = {
  id: string;
  chainId: string;
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

type RoundsVariables = {
  orderBy?:
    | "roundStartTime"
    | "roundEndTime"
    | "applicationsStartTime"
    | "applicationsEndTime";
  orderDirection?: "asc" | "desc";
  where?: TimestampVariables & {
    payoutStrategy?: { strategyName_in: string[] };
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
  roundEndTime_gt?: string;
  roundEndTime_lt?: string;
};

function getActiveChainIds() {
  const activeChainIds: string[] = [];
  const isProduction = process.env.REACT_APP_ENV === "production";

  for (const chainId of Object.values(ChainId)) {
    if (!isNaN(+chainId)) {
      continue;
    }
    if (
      isProduction &&
      [
        ChainId.GOERLI_CHAIN_ID,
        ChainId.FANTOM_MAINNET_CHAIN_ID,
        ChainId.FANTOM_TESTNET_CHAIN_ID,
      ].includes(ChainId[chainId as keyof typeof ChainId])
    ) {
      continue;
    }
    activeChainIds.push(chainId.toString());
  }
  return activeChainIds;
}

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

export function useRoundsTakingApplications() {
  const currentTimestamp = Math.floor(Date.now() / 1000).toString();
  const infiniteTimestamp = ethers.constants.MaxUint256.toString();

  return useRounds({
    where: {
      and: [
        { applicationsStartTime_lte: currentTimestamp },
        {
          or: [
            { applicationsEndTime: infiniteTimestamp },
            { applicationsEndTime_gte: currentTimestamp },
          ],
        },
      ],
    },
  });
}

// What filters for active rounds?
export function useActiveRounds() {
  const currentTimestamp = Math.floor(Date.now() / 1000).toString();
  const futureTimestamp = Math.floor(
    (Date.now() + 3600 * 24 * 365 * 10 * 1000) / 1000
  ).toString();

  return useRounds({
    orderBy: "roundEndTime",
    orderDirection: "desc",
    where: {
      // Must be after current time
      roundStartTime_lt: currentTimestamp,
      roundEndTime_gt: currentTimestamp,
      roundEndTime_lt: futureTimestamp,
    },
  });
}

export function useRoundsEndingSoon() {
  const currentTimestamp = Math.floor(Date.now() / 1000).toString();
  return useRounds({
    orderBy: "roundEndTime",
    orderDirection: "asc",
    where: {
      // Must be after current time
      roundEndTime_gt: currentTimestamp,
    },
  });
}

// TODO: Filter + sort rounds (status, network, sort)
export function useFilterRounds() {
  return useRounds({});
}

//
export function useRounds(variables: RoundsVariables) {
  const { cache } = useSWRConfig();
  const debugModeEnabled = useDebugMode();
  const chainIds = getActiveChainIds();

  const query = useSWR(
    ["rounds", variables, chainIds],
    () =>
      Promise.all(
        chainIds.flatMap((chainId) => {
          const chainIdEnumValue = ChainId[chainId as keyof typeof ChainId];
          return graphql_fetch(ROUNDS_QUERY, chainIdEnumValue, variables).then(
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
        .then((rounds) => sortRounds(rounds, variables)),

    { keepPreviousData: true }
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
  const currentTimestamp = Math.floor(Date.now() / 1000).toString();
  const { mutate } = useSWRConfig();

  return useSWR(["rounds-list", { chainIds }], () => {
    return chainIds.flatMap((chainId) => {
      const chainIdEnumValue = ChainId[chainId as keyof typeof ChainId];

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
        chainIdEnumValue,
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
  });
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
