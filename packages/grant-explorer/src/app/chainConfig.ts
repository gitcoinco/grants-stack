import {
  avalanche,
  avalancheFuji,
  fantom,
  fantomTestnet,
  mainnet,
  optimism,
  polygon,
  polygonMumbai,
} from "wagmi/chains";
import { Chain, arbitrum, arbitrumGoerli } from "viem/chains";
import {
  pgnTestnet,
  pgn,
  base,
  scroll,
  zkSyncEraMainnet,
  // zkSyncEraTestnet,
  sepolia,
  // seiDevnet,
  customLukso as lukso,
  customLuksoTestnet as luksoTestnet,
  customCelo as celo,
  customCeloAlfajores as celoAlfajores,
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
  // zkSyncEraTestnet,
  sepolia,
  // seiDevnet,
  luksoTestnet,
  celoAlfajores,
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
  lukso,
  celo,
].map(ensureValidChainId);

export const getEnabledChains = (): [Chain, ...Chain[]] => {
  switch (process.env.REACT_APP_ENV) {
    case "development":
      return [...TESTNET_CHAINS, ...MAINNET_CHAINS] as [Chain, ...Chain[]];
    case "production":
      return [...MAINNET_CHAINS] as [Chain, ...Chain[]];
    case "test":
      return [...MAINNET_CHAINS] as [Chain, ...Chain[]];
    default:
      throw new Error(
        `Unrecognized REACT_APP_ENV: ${process.env.REACT_APP_ENV}`
      );
  }
};
