import { ChainId } from "common";
import { RoundGetRound } from "data-layer";

export function createRoundLoadingData(length = 4): RoundGetRound[] {
  return Array.from({ length }).map((_, i) => ({
    id: String(i),
    chainId: ChainId.MAINNET,
    createdAtBlock: 1,
    applicationMetaPtr: {
      protocol: 1,
      pointer: "",
    },
    applicationsStartTime: "0",
    applicationsEndTime: "0",
    donationsStartTime: "0",
    donationsEndTime: "0",
    matchAmount: "",
    matchTokenAddress: "0",
    strategyName: "MERKLE",
    roundMetadata: {
      name: "Round",
      eligibility: {
        description: "",
      },
      programContractAddress: "",
    },
    roundMetadataCid: "",
    applications: [],
    strategyId: "",
    strategyAddress: "",
  }));
}
