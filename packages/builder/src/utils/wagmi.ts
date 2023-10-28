import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient } from "wagmi";
import {
  mainnet,
  arbitrum,
  optimism,
  goerli,
  arbitrumGoerli,
} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import {
  pgn,
  pgnTestnet,
  devChain1,
  devChain2,
  avalanche,
  avalancheFuji,
  fantom,
  fantomTestnet,
} from "common/src/chains";
import { getEnv } from "common/src/env";
import { polygon, polygonMumbai } from "@wagmi/core/chains";

// RPC keys
const alchemyId = getEnv("REACT_APP_ALCHEMY_ID", {
  required: false,
  defaultValue: "",
});
const infuraId = getEnv("REACT_APP_INFURA_ID", {
  required: false,
  defaultValue: "",
});

const availableChains: { [key: string]: Chain } = {
  dev1: devChain1,
  dev2: devChain2,
  mainnet,
  fantom,
  optimism,
  pgn,
  arbitrum,
  avalanche,
  polygon,
  goerli,
  fantomTestnet,
  pgnTestnet,
  arbitrumGoerli,
  polygonMumbai,
  avalancheFuji,
};

const stagingChains = [
  devChain1,
  devChain2,
  optimism,
  goerli,
  fantomTestnet,
  fantom,
  mainnet,
  pgnTestnet,
  pgn,
  arbitrum,
  arbitrumGoerli,
  polygon,
  polygonMumbai,
  avalanche,
  avalancheFuji,
];

const productionChains = [
  mainnet,
  fantom,
  optimism,
  pgn,
  arbitrum,
  avalanche,
  polygon,
];

function enabledChainsAndProviders() {
  const chains: Chain[] = [];
  const providers = [publicProvider({ priority: 2 })];

  const chainsConfig = getEnv("REACT_APP_CHAINS", { required: false });
  const selectedChainsNames =
    chainsConfig !== undefined && chainsConfig !== ""
      ? chainsConfig.split(",").map((name) => name.trim())
      : [];

  let usingDevOnlyChains = true;

  if (selectedChainsNames.length > 0) {
    // if REACT_APP_CHAINS is specified we use those
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
  } else if (getEnv("REACT_APP_ENV") === "production") {
    // if REACT_APP_CHAINS is not specified  ans we are in production
    // we use the default chains for production environments
    usingDevOnlyChains = false;
    chains.push(...productionChains);
  } else {
    // if REACT_APP_CHAINS is not specified we use the
    // default chains for staging
    usingDevOnlyChains = false;
    chains.push(...stagingChains);
  }

  if (!usingDevOnlyChains) {
    if (infuraId === "" || alchemyId === "") {
      throw new Error(
        "REACT_APP_INFURA_ID and REACT_APP_ALCHEMY_ID must be set to use non-local chains"
      );
    }

    providers.push(
      infuraProvider({ apiKey: infuraId!, priority: 0 }),
      alchemyProvider({ apiKey: alchemyId!, priority: 1 })
    );
  }

  return { chains, providers };
}

const { chains: enabledChains, providers: enabledProviders } =
  enabledChainsAndProviders();

export const { chains, provider } = configureChains(
  enabledChains,
  enabledProviders
);

// Custom wallet connectors: more can be added by going here:
// https://www.rainbowkit.com/docs/custom-wallet-list
const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      coinbaseWallet({ appName: "Builder", chains }),
      metaMaskWallet({
        chains,
        projectId: "0000000000" /* We don't support walletconnect */,
      }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default wagmiClient;
