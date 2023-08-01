import { ChainId } from "common";

// @ts-expect-error TODO: add addys from other chains
export const MRC_CONTRACTS: Record<ChainId, string> = {
  [ChainId.PGN_TESTNET]: "0x4268900E904aD87903De593AA5424406066d9ea2",
  [ChainId.GOERLI_CHAIN_ID]: "0x69433D914c7Cd8b69710a3275bcF3df4CB3eDA94",
};
