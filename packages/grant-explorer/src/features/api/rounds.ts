import { ChainId, graphql_fetch } from "common";
import { RoundMetadata } from "./round";
import { MetadataPointer } from "./types";
import { fetchFromIPFS } from "./utils";

interface GetRoundOverviewResult {
  data: {
    rounds: RoundOverview[];
  };
}

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
};

async function fetchRoundsByTimestamp(
  query: string,
  chainId: string
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
    rounds.forEach(async (round: RoundOverview, index) => {
      const roundMetadata: RoundMetadata = await fetchFromIPFS(
        round.roundMetaPtr.pointer
      );
      rounds[index].roundMetadata = roundMetadata;
      rounds[index].chainId = chainId;
    });

    return rounds;
  } catch (error) {
    console.log("error: fetchRoundsByTimestamp", error);
    return [];
  }
}

function getActiveChainIds() {
  const activeChainIds: string[] = [];
  const isProduction = process.env.REACT_APP_ENV === "production";

  for (const chainId of Object.values(ChainId)) {
    if (
      isProduction &&
      [
        ChainId.GOERLI_CHAIN_ID,
        ChainId.FANTOM_MAINNET_CHAIN_ID,
        ChainId.FANTOM_TESTNET_CHAIN_ID,
      ].includes(chainId as ChainId)
    ) {
      continue;
    }
    activeChainIds.push(chainId.toString());
  }

  return activeChainIds;
}

export async function getRoundsInApplicationPhase(): Promise<{
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
        }
      }
    `;

    for (let i = 0; i < chainIds.length; i++) {
      const roundsForChainId = await fetchRoundsByTimestamp(query, chainIds[i]);
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

export async function getActiveRounds(): Promise<{
  isLoading: boolean;
  error: unknown;
  rounds: RoundOverview[];
}> {
  try {
    let isLoading = true;
    const chainIds = getActiveChainIds();
    const rounds: RoundOverview[] = [];

    const query = `
      query GetRoundsInApplicationPhase($currentTimestamp: String) {
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
        }
      }
    `;

    for (let i = 0; i < chainIds.length; i++) {
      const roundsForChainId = await fetchRoundsByTimestamp(query, chainIds[i]);
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
