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
  roundMetaPtr: MetadataPointer;
  applicationMetaPtr: MetadataPointer;
  applicationsStartTime: string;
  applicationsEndTime: string;
  roundStartTime: string;
  roundEndTime: string;
  matchAmount: string;
  token: string;
  roundMetadata ?: RoundMetadata;
}

async function fetchRoundsByTimestamp(query: string, chainId: string): Promise<RoundOverview[]> {
  
  try {
    const chainIdEnumValue = ChainId[chainId as keyof typeof ChainId];
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const res: GetRoundOverviewResult = await graphql_fetch(
      query,
      chainIdEnumValue,
      { currentTimestamp }
    );

    let rounds: RoundOverview[] = res.data.rounds;
    rounds.forEach(async (round, index) => {

      const roundMetadata: RoundMetadata = await fetchFromIPFS(
        round.roundMetaPtr.pointer
      );
      rounds[index].roundMetadata = roundMetadata;

    });

    return rounds;

  } catch (error) {
    console.log("error: fetchRoundsByTimestamp", error);
    return [];
  }
}

export async function getRoundsInApplicationPhase(): Promise<RoundOverview[]> {
  try {

    const chainIds = Object.keys(ChainId)
    let rounds: RoundOverview[] = [];

    const query = `
      query GetRoundsInApplicationPhase($current_timestamp: Number) {
        rounds(where: {
          applicationsStartTime_lt: $current_timestamp 
          applicationsEndTime_gt: $current_timestamp
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

    chainIds.forEach(async chainId => {
      let roundsForChainId = await fetchRoundsByTimestamp(query, chainId);
      rounds.push(...roundsForChainId);
    })

    return rounds;
  } catch (error) {
    console.error("getRoundsInApplicationPhase", error);
    throw Error("Unable to fetch rounds");
  }
}

export async function getActiveRounds(): Promise<RoundOverview[]> {
  try {

    const chainIds = Object.keys(ChainId)
    let rounds: RoundOverview[] = [];

    const query = `
      query GetRoundsInApplicationPhase($current_timestamp: Number) {
        rounds(where: {
          roundStartTime_lt: $current_timestamp 
          roundEndTime_gt: $current_timestamp
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

    chainIds.forEach(async chainId => {
      let roundsForChainId = await fetchRoundsByTimestamp(query, chainId);
      rounds.push(...roundsForChainId);
    })

    return rounds;
  } catch (error) {
    console.error("getActiveRounds", error);
    throw Error("Unable to fetch rounds");
  }
}