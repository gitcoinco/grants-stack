import { Chain } from "@rainbow-me/rainbowkit";
import { arbitrum, arbitrumGoerli } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import {
  pgn,
  pgnTestnet,
  zkSyncEraMainnet,
  zkSyncEraTestnet,
  devChain1,
  devChain2,
  avalanche,
  avalancheFuji,
  fantom,
  base,
  fantomTestnet,
  customOptimism,
  customPolygon,
  customMainnet,
  sepolia,
  scroll,
  seiDevnet,
  customCelo as celo,
  customCeloAlfajores as celoAlfajores,
  customLukso as lukso,
  customLuksoTestnet as luksoTestnet,
} from "common/src/chains";
import { getConfig } from "common/src/config";
import { polygonMumbai } from "@wagmi/core/chains";

const availableChains: { [key: string]: Chain } = {
  dev1: devChain1,
  dev2: devChain2,
  mainnet: customMainnet,
  fantom,
  optimism: customOptimism,
  pgn,
  celo,
  celoAlfajores,
  arbitrum,
  avalanche,
  polygon: customPolygon,
  base,
  scroll,
  fantomTestnet,
  pgnTestnet,
  arbitrumGoerli,
  polygonMumbai,
  avalancheFuji,
  zkSyncEraMainnet,
  zkSyncEraTestnet,
  sepolia,
  seiDevnet,
  lukso,
  luksoTestnet,
};

const stagingChains = [
  devChain1,
  devChain2,
  customOptimism,
  fantomTestnet,
  fantom,
  customMainnet,
  pgnTestnet,
  pgn,
  arbitrum,
  base,
  scroll,
  arbitrumGoerli,
  customPolygon,
  polygonMumbai,
  avalanche,
  avalancheFuji,
  zkSyncEraMainnet,
  zkSyncEraTestnet,
  sepolia,
  seiDevnet,
  celo,
  celoAlfajores,
  lukso,
  luksoTestnet,
];

const productionChains = [
  customMainnet,
  fantom,
  customOptimism,
  pgn,
  arbitrum,
  avalanche,
  customPolygon,
  zkSyncEraMainnet,
  base,
  scroll,
  seiDevnet,
  celo,
  lukso,
];

export function getEnabledChainsAndProviders() {
  const config = getConfig();
  const chains: Chain[] = [];
  const providers = [publicProvider({ priority: 2 })];

  const {
    blockchain: { chainsOverride },
  } = config;
  const selectedChainsNames =
    chainsOverride !== undefined &&
    chainsOverride.trim() !== "" &&
    // FIXME: now that we are validating config vars with zod, we allow optional vars.
    // Until we finalize the global configuration we leave chainsOverride in prod set as "-"
    // to make the verify-env task passing.
    // When we finish the refactoring to use the global config everywhere, we can change the way we
    // verify the env vars
    chainsOverride !== "-"
      ? chainsOverride.split(",").map((name) => name.trim())
      : [];

  if (selectedChainsNames.length > 0) {
    // if REACT_APP_CHAINS_OVERRIDE is specified we use those
    selectedChainsNames.forEach((name) => {
      const chain = availableChains[name];
      if (chain === undefined) {
        throw new Error(
          `availableChains doesn't contain a chain called "${name}"`
        );
      }

      chains.push(chain);
    });
  } else if (config.appEnv === "production") {
    // if REACT_APP_CHAINS_OVERRIDE is not specified  ans we are in production
    // we use the default chains for production environments
    chains.push(...productionChains);
  } else {
    // if REACT_APP_CHAINS_OVERRIDE is not specified we use the
    // default chains for staging
    chains.push(...stagingChains);
  }

  if (config.blockchain.infuraId !== undefined) {
    providers.push(
      infuraProvider({ apiKey: config.blockchain.infuraId!, priority: 0 })
    );
  }

  if (config.blockchain.alchemyId !== undefined) {
    providers.push(
      alchemyProvider({ apiKey: config.blockchain.alchemyId!, priority: 1 })
    );
  }

  return { chains, providers };
}
