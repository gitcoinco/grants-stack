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
  projects?: [];
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

          ${
            process.env.NODE_ENV === "production"
              ? `program_: {
            id: "0xa1b6245d7ba4b126adf7ee1e05e96bfda974990c"
          }`
              : ""
          }

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
      query GetActiveRounds($currentTimestamp: String) {
        rounds(where: {
          roundStartTime_lt: $currentTimestamp
          roundEndTime_gt: $currentTimestamp

          ${
            process.env.NODE_ENV === "production"
              ? `id_in: [
            "0x12bb5bbbfe596dbc489d209299b8302c3300fa40",
            "0x274554eb289004e15a7679123901b7f070dda0fa",
            "0xaa40e2e5c8df03d792a52b5458959c320f86ca18",
            "0x421510312c40486965767be5ea603aa8a5707983",
            "0xdf22a2c8f6ba9376ff17ee13e6154b784ee92094",
            "0x9c3b81967eafba0a451e324417dd4f3f353b997b",
            "0x64e5b2228ef31437909900b38fc42dd5e4b83147",
            "0x9e669c0a6e075f14ba9d9d98c3580ad67e20ec38",
            "0x8aa06b3b8cac2970857f4e0fd78f21dc01aade94",
            "0x8aa06b3b8cac2970857f4e0fd78f21dc01aade94",
            "0x6e8dc2e623204d61b0e59e668702654ae336c9f7",
            "0xf1c021df6dc6b2dc2e5a837cdfddc2f42503233b",
            "0x859faeaa266ba13bd1e72eb6dd7a223902d1adfe",
            "0x905efbabe2d52cd648fadfafcec8d6c8c60f7423",
            "0x32c49d2da5f6866a057e4aa2058c62a2974a5623",
            "0x64aa545c9c63944f8e765d9a65eda3cbbdc6e620"
          ]`
              : ""
          }
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
