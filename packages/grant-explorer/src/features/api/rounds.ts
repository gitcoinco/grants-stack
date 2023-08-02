import { ChainId, graphql_fetch } from "common";
import { RoundMetadata } from "./round";
import { MetadataPointer } from "./types";
import { fetchFromIPFS } from "./utils";

interface GetRoundOverviewResult {
  data: {
    rounds: RoundOverview[];
  };
}

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
};

async function fetchRoundsByTimestamp(
  query: string,
  chainId: string,
  debugModeEnabled: boolean
): Promise<RoundOverview[]> {
  try {
    const chainIdEnumValue = ChainId[chainId as keyof typeof ChainId];
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();

    const res: GetRoundOverviewResult = await graphql_fetch(
      query,
      chainIdEnumValue,
      { currentTimestamp }
    );

    if (!res.data || !res.data.rounds) {
      return [];
    }

    const rounds: RoundOverview[] = res.data.rounds;
    const filteredRounds: RoundOverview[] = [];

    for (const round of rounds) {
      const roundMetadata: RoundMetadata = await fetchFromIPFS(
        round.roundMetaPtr.pointer
      );
      round.roundMetadata = roundMetadata;
      round.chainId = chainId;

      // check if roundType is public & if so, add to filteredRounds
      if (round.roundMetadata?.roundType === "public") {
        filteredRounds.push(round);
      }

      // check if round.id is in validRounds & if so, add to filteredRounds
      if (validRounds.includes(round.id)) {
        filteredRounds.push(round);
      }

      // check if round.id is in invalidRounds & if so, remove from filteredRounds
      if (invalidRounds.includes(round.id)) {
        const index = filteredRounds.findIndex((r) => r.id === round.id);
        if (index > -1) {
          filteredRounds.splice(index, 1);
        }
      }
    }

    return debugModeEnabled ? rounds : filteredRounds;
  } catch (error) {
    console.log("error: fetchRoundsByTimestamp", error);
    return [];
  }
}

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

export async function getRoundsInApplicationPhase(
  debugModeEnabled: boolean
): Promise<{
  isLoading: boolean;
  error: unknown;
  rounds: RoundOverview[];
}> {
  try {
    const chainIds = getActiveChainIds();

    const rounds: RoundOverview[] = [];

    const query = `
      query GetRoundsInApplicationPhase($currentTimestamp: String) {
        rounds(where: {
          applicationsStartTime_lt: $currentTimestamp
          applicationsEndTime_gt: $currentTimestamp
        }) {
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

          projects(where:{
            status: 1
          }) {
            id
          }
        }
      }
    `;

    for (let i = 0; i < chainIds.length; i++) {
      const roundsForChainId = await fetchRoundsByTimestamp(
        query,
        chainIds[i],
        debugModeEnabled
      );
      rounds.push(...roundsForChainId);
    }

    return {
      isLoading: false,
      error: undefined,
      rounds,
    };
  } catch (error) {
    console.error("getRoundsInApplicationPhase", error);
    return {
      isLoading: false,
      error,
      rounds: [],
    };
  }
}

export async function getActiveRounds(debugModeEnabled: boolean): Promise<{
  isLoading: boolean;
  error: unknown;
  rounds: RoundOverview[];
}> {
  try {
    let isLoading = true;
    const chainIds = getActiveChainIds();
    const rounds: RoundOverview[] = [];

    const query = `
      query GetActiveRounds($currentTimestamp: String) {
        rounds(where: {
          roundStartTime_lt: $currentTimestamp
          roundEndTime_gt: $currentTimestamp
        }) {
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

          projects(where:{
            status: 1
          }) {
            id
          }
        }
      }
    `;

    for (let i = 0; i < chainIds.length; i++) {
      console.log(chainIds);
      const roundsForChainId = await fetchRoundsByTimestamp(
        query,
        chainIds[i],
        debugModeEnabled
      );
      rounds.push(...roundsForChainId);
    }

    const error = undefined;
    isLoading = false;

    return {
      isLoading,
      error,
      rounds,
    };
  } catch (error) {
    console.error("getActiveRounds", error);
    return {
      isLoading: false,
      error,
      rounds: [],
    };
  }
}
