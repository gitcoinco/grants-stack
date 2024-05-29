import "@rainbow-me/rainbowkit/styles.css";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createClient, configureChains, Chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { TChain, getChains } from "common";

const testnetChains = () => {
  // todo: create viem chains from getChains
  return getChains().filter((chain) => chain.type === "testnet");
};

const mainnetChains = () => {
  return getChains().filter((chain) => chain.type === "mainnet");
};

const allChains: TChain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];

// fixme: this needs finished/fixedÍ
const allChainsMap: Chain[] = allChains.map((chain) => {
  // Map the TChain to Chain
  const mappedChain: Chain = {
    id: chain.id,
    name: chain.name,
    network: chain.name,
    nativeCurrency: {
      name: "DUNNO",
      symbol: "DUNNO",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [],
        webSocket: undefined,
      },
      public: {
        http: [],
        webSocket: undefined,
      },
    },
  };

  return mappedChain;
});

/* TODO: remove hardcoded value once we have environment variables validation */
const projectId =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ??
  "2685061cae0bcaf2b244446153eda9e1";
export const { chains, provider, webSocketProvider } = configureChains(
  // note: this is a map of all available chains for environment
  allChainsMap,
  [
    infuraProvider({
      apiKey: process.env.REACT_APP_INFURA_ID as string,
      priority: 0,
    }),
    alchemyProvider({
      apiKey: process.env.REACT_APP_ALCHEMY_ID as string,
      priority: 1,
    }),
    publicProvider({ priority: 2 }),
  ]
);

// Custom wallet connectors: more can be added by going here:
// https://www.rainbowkit.com/docs/custom-wallet-list
const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ chains, projectId }),
      coinbaseWallet({ appName: "Gitcoin Round Manager", chains }),
      metaMaskWallet({ chains, projectId }),
    ],
  },
]);

export const client = createClient({
  autoConnect: true,
  connectors: connectors,
  provider,
  webSocketProvider,
});
