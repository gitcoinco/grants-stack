import { ChainId, RoundPayoutType, graphql_fetch } from "common";
import { RoundMetadata } from "./round";
import { MetadataPointer } from "./types";
import { fetchFromIPFS } from "./utils";
import { ethers } from "ethers";
import { allChains } from "../../app/chainConfig";

interface GetRoundOverviewResult {
  data: {
    rounds: RoundOverview[];
  };
}

const validRounds = [
  "0x35c9d05558da3a3f3cddbf34a8e364e59b857004", // "Metacamp Onda 2023 FINAL
  "0x984e29dcb4286c2d9cbaa2c238afdd8a191eefbc", // Gitcoin Citizens Round #1
  "0x4195cd3cd76cc13faeb94fdad66911b4e0996f38", // Greenpill Q2 2023
];

const invalidRounds = ["0xde272b1a1efaefab2fd168c02b8cf0e3b10680ef"]; // Meg hello

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

async function fetchRoundsByTimestamp(
  query: string,
  chainId: string,
  debugModeEnabled: boolean,
): Promise<RoundOverview[]> {
  try {
    const chainIdEnumValue = ChainId[chainId as keyof typeof ChainId];
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();
    const infiniteTimestamp = ethers.constants.MaxUint256.toString();

    const res: GetRoundOverviewResult = await graphql_fetch(
      query,
      chainIdEnumValue,
      { currentTimestamp, infiniteTimestamp },
    );

    if (!res.data || !res.data.rounds) {
      return [];
    }

    const rounds: RoundOverview[] = res.data.rounds;
    const filteredRounds: RoundOverview[] = [];

    for (const round of rounds) {
      const roundMetadata: RoundMetadata = await fetchFromIPFS(
        round.roundMetaPtr.pointer,
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

const activeChainIds = () =>
  allChains.map((chain) => chain.id).map((chainId) => chainId.toString());

export async function getRoundsInApplicationPhase(
  debugModeEnabled: boolean,
): Promise<RoundOverview[]> {
  const query = `
      query GetRoundsInApplicationPhase($currentTimestamp: String, $infiniteTimestamp: String) {
        rounds(where:
          { and: [
            { applicationsStartTime_lte: $currentTimestamp }, 
            { or: [
              { applicationsEndTime: $infiniteTimestamp }, 
              { applicationsEndTime_gte: $currentTimestamp }] 
            }]
          }
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

  const rounds = await Promise.all(
    activeChainIds().map((chainId) =>
      fetchRoundsByTimestamp(query, chainId, debugModeEnabled),
    ),
  );

  return rounds.flat();
}

export async function getActiveRounds(
  debugModeEnabled: boolean,
): Promise<RoundOverview[]> {
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

  const rounds = await Promise.all(
    activeChainIds().map((chainId) =>
      fetchRoundsByTimestamp(query, chainId, debugModeEnabled),
    ),
  );

  return rounds.flat();
}
