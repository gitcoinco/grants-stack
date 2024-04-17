import {
  avalanche,
  avalancheFuji,
  Chain,
  fantom,
  fantomTestnet,
  mainnet,
  optimism,
  polygon,
  polygonMumbai,
} from "wagmi/chains";
import { arbitrum, arbitrumGoerli } from "viem/chains";
import {
  pgnTestnet,
  pgn,
  base,
  scroll,
  zkSyncEraMainnet,
  zkSyncEraTestnet,
  sepolia,
  seiDevnet,
} from "common/src/chains";
import { ChainId } from "common/src/chain-ids";

const ensureValidChainId = (chain: Chain) => {
  if (Object.values(ChainId).includes(chain.id)) {
    return chain;
  } else {
    throw new Error(`Chain id not recognized: ${chain.id}`);
  }
};

const TESTNET_CHAINS = [
  { ...fantomTestnet, iconUrl: "/logos/fantom-logo.svg" },
  pgnTestnet,
  arbitrumGoerli,
  avalancheFuji,
  polygonMumbai,
  zkSyncEraTestnet,
  sepolia,
  seiDevnet,
].map(ensureValidChainId);

const MAINNET_CHAINS = [
  mainnet,
  optimism,
  pgn,
  arbitrum,
  avalanche,
  polygon,
  zkSyncEraMainnet,
  base,
  scroll,
  { ...fantom, iconUrl: "/logos/fantom-logo.svg" },
  seiDevnet,
].map(ensureValidChainId);

export const getEnabledChains = (): Chain[] => {
  switch (process.env.REACT_APP_ENV) {
    case "development":
      return [...TESTNET_CHAINS, ...MAINNET_CHAINS];
    case "production":
      return MAINNET_CHAINS;
    case "test":
      return MAINNET_CHAINS;
    default:
      throw new Error(
        `Unrecognized REACT_APP_ENV: ${process.env.REACT_APP_ENV}`
      );
  }
};
