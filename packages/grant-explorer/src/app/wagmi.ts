import "@rainbow-me/rainbowkit/styles.css";

import {
  connectorsForWallets,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { getEnabledChains } from "./chainConfig";
import { getChains, TChain } from "common";
import { Chain, zeroAddress } from "viem";

const testnetChains = () => {
  return getChains().filter((chain) => chain.type === "testnet");
};

const mainnetChains = () => {
  return getChains().filter((chain) => chain.type === "mainnet");
};

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

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  allChainsMap,
  [
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_ID as string }),
    publicProvider(),
  ]
);

/** We perform environment variable verification at buildtime, so all process.env properties are guaranteed to be strings */
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID as string;

const { wallets } = getDefaultWallets({
  appName: "Grant Explorer",
  projectId,
  chains,
});

const connectors = connectorsForWallets([
  {
    ...wallets,
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ chains, projectId }),
      coinbaseWallet({ appName: "Gitcoin Explorer", chains }),
      metaMaskWallet({ chains, projectId }),
    ],
  },
]);

export const config = createConfig({
  autoConnect: true,
  connectors: connectors,
  publicClient,
  webSocketPublicClient,
});
