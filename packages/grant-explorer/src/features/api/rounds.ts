import useSWR, { useSWRConfig, Cache } from "swr";
import { ChainId, RoundPayoutType, graphql_fetch } from "common";
import { RoundMetadata } from "./round";
import { MetadataPointer } from "./types";
import { fetchFromIPFS, useDebugMode } from "./utils";
import { allChains } from "../../app/chainConfig";
import { tryParseChainIdToEnum } from "common/src/chains";
import { isPresent } from "ts-is-present";
import { createTimestamp } from "../discovery/utils/createRoundsStatusFilter";

const validRounds = [
  "0x35c9d05558da3a3f3cddbf34a8e364e59b857004", // "Metacamp Onda 2023 FINAL
  "0x984e29dcb4286c2d9cbaa2c238afdd8a191eefbc", // Gitcoin Citizens Round #1
  "0x4195cd3cd76cc13faeb94fdad66911b4e0996f38", // Greenpill Q2 2023
];

const invalidRounds = ["0xde272b1a1efaefab2fd168c02b8cf0e3b10680ef"]; // Meg hello

export type RoundOverview = {
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
  roundMetadata?: RoundMetadata;
  projects?: { id: string }[];
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
  where?: {
    and: [
      { or: TimestampVariables[] },
      { payoutStrategy_?: { or: { strategyName: string }[] } },
    ];
  };
};
export type TimestampVariables = {
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

export function useRounds(
  variables: RoundsVariables,
  chainIds: ChainId[] = getActiveChainIds()
) {
  const { cache, mutate } = useSWRConfig();
  const debugModeEnabled = useDebugMode();

  const mergedVariables = {
    ...variables,
    // We need to overfetch these because many will be filtered out from the metadata.roundType === "public"
    // The `first` param in the arguments will instead be used last to limit the results returned
    first: 100,
  };

  const query = useSWR(
    // Cache requests on chainIds and variables as keys (when these are the same, cache will be used instead of new requests)
    ["rounds", chainIds, variables],
    () =>
      Promise.all(
        chainIds.flatMap((chainId) =>
          graphql_fetch(ROUNDS_QUERY, chainId, mergedVariables).then(
            (r) =>
              r.data?.rounds?.map((round: RoundOverview) => ({
                ...round,
                chainId,
              })) ?? []
          )
        )
      )
        .then((res) => res.flat())
        .then(filterRoundsWithProjects)
        .then(cleanRoundData)
        .then(async (rounds) => {
          // Load the metadata for the rounds
          fetchRoundsMetadata(rounds);

          // Return the rounds immediately
          return rounds;

          function fetchRoundsMetadata(rounds: RoundOverview[]): void {
            Promise.all(
              rounds.map(async (round) => {
                // Check if cache exist (we only need to fetch this once)
                const cid = round.roundMetaPtr.pointer;
                if (!cache.get(`@"metadata","${cid}",`)) {
                  // Fetch metadata and update cache
                  mutate(["metadata", cid], await fetchFromIPFS(cid));
                  return round;
                }
              })
            ).then((roundsWithMetadata) => {
              // Reset the cache
              if (roundsWithMetadata.filter(Boolean).length) {
                mutate(["rounds", chainIds, variables]);
              }
            });
          }
        })
        // We need to do another sort because of results from many chains
        .then((rounds) => sortRounds(rounds, variables))
  );

  const data = (debugModeEnabled ? query.data : filterRounds(cache, query.data))
    // Limit final results returned
    ?.slice(0, variables.first ?? query.data?.length);

  return {
    ...query,
    data,
  };
}

export function filterRoundsWithProjects(rounds: RoundOverview[]) {
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

const timestampKeys = [
  "roundStartTime",
  "roundEndTime",
  "applicationsStartTime",
  "applicationsEndTime",
] as const;

export function sortRounds(
  rounds: RoundOverview[],
  { orderBy = "roundEndTime", orderDirection = "asc" }: RoundsVariables
) {
  const dir = { asc: 1, desc: -1 };
  /*
  Something to note about sorting by matchAmount is that it doesn't
  take token decimals into consideration. For example USDC has 6 decimals.
  */
  const isNumber = ["matchAmount", ...timestampKeys].includes(orderBy);

  const compareFn = isNumber
    ? (a: RoundOverview, b: RoundOverview) =>
        BigInt(a[orderBy] ?? Number.MAX_SAFE_INTEGER) >
        BigInt(b[orderBy] ?? Number.MAX_SAFE_INTEGER)
    : (a: RoundOverview, b: RoundOverview) =>
        a[orderBy] ?? "" > b[orderBy] ?? "";

  return [...rounds].sort((a, b) =>
    compareFn(a, b) ? dir[orderDirection] : -dir[orderDirection]
  );
}
/* 
Some timestamps are in milliseconds and others in overflowed values (115792089237316195423570985008687907853269984665640564039457584007913129639935)
See this query: https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet/graphql?query=query+%7B%0A+++rounds%28first%3A+3%2C%0A++++++orderBy%3A+roundEndTime%2C%0A++++++orderDirection%3A+asc%0A++++%29+%7B%0A++++++id%0A++++++roundEndTime%0A+++++%0A++++%7D%0A%7D
*/
const OVERFLOWED_TIMESTAMP =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export function cleanRoundData(rounds: RoundOverview[]) {
  return rounds.map((round) => ({
    ...round,
    ...timestampKeys.reduce(
      (acc, key) => ({
        ...acc,
        [key]:
          round[key] === OVERFLOWED_TIMESTAMP
            ? undefined
            : round[key].length > 10 // This timestamp is in milliseconds, convert to seconds
            ? Math.round(Number(round[key]) / 1000).toString()
            : round[key],
      }),
      {}
    ),
  }));
}

export function filterRounds(
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
