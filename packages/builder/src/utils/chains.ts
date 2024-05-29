import { Chain } from "@rainbow-me/rainbowkit";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { getConfig } from "common/src/config";
import { getChains, TChain } from "common";
import { zeroAddress } from "viem";

const testnetChains = () =>
  getChains().filter((chain) => chain.type === "testnet");

const mainnetChains = () =>
  getChains().filter((chain) => chain.type === "mainnet");

const allChains: TChain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];

// Map the TChain to Chain type. This is required until we update the dependencies.
const allChainsMap: Chain[] = allChains.map((chain) => {
  // Filter by zero address to get the native token
  const nativeToken = chain.tokens.find(
    (token) => token.address === zeroAddress
  );
  // Map the TChain to Chain
  const mappedChain: Chain = {
    id: chain.id,
    name: chain.name,
    network: chain.name,
    nativeCurrency: {
      name: nativeToken?.code as string,
      symbol: nativeToken?.code as string,
      decimals: nativeToken?.decimals as number,
    },
    rpcUrls: {
      default: {
        http: [chain.rpc],
        webSocket: undefined,
      },
      public: {
        http: [chain.rpc],
        webSocket: undefined,
      },
    },
  };

  return mappedChain;
});

const stagingChains = testnetChains().map((chain) => {
  const mappedChain: Chain = {
    id: chain.id,
    name: chain.name,
    network: chain.name,
    nativeCurrency: {
      name: chain.tokens[0].code,
      symbol: chain.tokens[0].code,
      decimals: chain.tokens[0].decimals,
    },
    rpcUrls: {
      default: {
        http: [chain.rpc],
        webSocket: undefined,
      },
      public: {
        http: [chain.rpc],
        webSocket: undefined,
      },
    },
  };
  return mappedChain;
});

const productionChains = mainnetChains().map((chain) => {
  const mappedChain: Chain = {
    id: chain.id,
    name: chain.name,
    network: chain.name,
    nativeCurrency: {
      name: chain.tokens[0].code,
      symbol: chain.tokens[0].code,
      decimals: chain.tokens[0].decimals,
    },
    rpcUrls: {
      default: {
        http: [chain.rpc],
        webSocket: undefined,
      },
      public: {
        http: [chain.rpc],
        webSocket: undefined,
      },
    },
  };
  return mappedChain;
});

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

      const chain = allChainsMap.find((c) => c.name === name);
      if (chain === undefined) {
        throw new Error(`allChains doesn't contain a chain called "${name}"`);
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
