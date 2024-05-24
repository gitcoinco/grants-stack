import { ChainId } from "./chain-ids";
import {
  getTokens,
  getTokensByChainId,
  TToken,
} from "@gitcoin/gitcoin-chain-data";

export const payoutTokens = [...getTokens()];

export const getPayoutTokens = (chainId: ChainId): TToken[] => {
  return getTokensByChainId(chainId);
};
