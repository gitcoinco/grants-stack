import { ChainId } from "common";
import { RoundOverview } from "../../api/rounds";

export function createRoundLoadingData(length = 4): RoundOverview[] {
  return Array.from({ length }).map((_, i) => ({
    id: String(i),
    chainId: ChainId.MAINNET,
    createdAt: "0",
    roundMetaPtr: {
      protocol: 1,
      pointer: "",
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: "",
    },
    applicationsStartTime: "0",
    applicationsEndTime: "0",
    roundStartTime: "0",
    roundEndTime: "0",
    matchAmount: "",
    token: "0",
    payoutStrategy: {
      id: "someid",
      strategyName: "MERKLE",
    },
  }));
}
