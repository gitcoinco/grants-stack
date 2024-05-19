import { ChainId } from "./chain-ids";
import { getTokensByChainId, TToken } from "@gitcoin/gitcoin-chain-data";

export const getPayoutTokens = (chainId: ChainId): TToken[] => {
  return getTokensByChainId(chainId);
};
