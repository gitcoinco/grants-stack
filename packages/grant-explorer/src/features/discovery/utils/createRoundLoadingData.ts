import { ChainId } from "common";
import { RoundGetRound } from "data-layer";
import { zeroAddress } from "viem";

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
    matchAmountInUsd: 10,
    matchAmount: "",
    matchTokenAddress: zeroAddress,
    strategyName: "allov1.QF",
    roundMetadata: {
      name: "Round",
      eligibility: {
        description: "",
      },
      programContractAddress: zeroAddress,
    },
    roundMetadataCid: "",
    applications: [],
    strategyId: "",
    strategyAddress: zeroAddress,
    tags: [],
  }));
}
