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

  let usingDevOnlyChains = true;

  if (selectedChainsNames.length > 0) {
    // if REACT_APP_CHAINS_OVERRIDE is specified we use those
    selectedChainsNames.forEach((name) => {
      // if it's not a local dev chain, it means we are using external
      // chains and we need infura/alchemy ids to be set
      if (!/^dev[1-9]+$/.test(name)) {
        usingDevOnlyChains = false;
      }

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
    usingDevOnlyChains = false;
    chains.push(...productionChains);
  } else {
    // if REACT_APP_CHAINS_OVERRIDE is not specified we use the
    // default chains for staging
    usingDevOnlyChains = false;
    chains.push(...stagingChains);
  }

  if (!usingDevOnlyChains) {
    if (
      process.env.NODE_ENV !== "test" &&
      (config.blockchain.infuraId === undefined ||
        config.blockchain.alchemyId === undefined)
    ) {
      throw new Error(
        "REACT_APP_INFURA_ID and REACT_APP_ALCHEMY_ID must be set to use non-local chains"
      );
    }

    providers.push(
      infuraProvider({ apiKey: config.blockchain.infuraId!, priority: 0 }),
      alchemyProvider({ apiKey: config.blockchain.alchemyId!, priority: 1 })
    );
  }

  return { chains, providers };
}
