import { getTokensByChainId, TToken } from "@gitcoin/gitcoin-chain-data";

export const getPayoutTokens = (chainId: number): TToken[] => {
  return getTokensByChainId(chainId);
};
