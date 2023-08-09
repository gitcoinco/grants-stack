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
import {
  mainnet,
  goerli,
  fantom,
  fantomTestnet,
  optimism,
  Chain,
} from "wagmi/chains";
import { configureChains, createConfig } from "wagmi";

import { pgnTestnet, pgn } from "common/src/chains";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";

const testnetChains = () => {
  return [
    goerli,
    { ...fantomTestnet, iconUrl: "/logos/fantom-logo.svg" },
    pgnTestnet,
  ];
};

const mainnetChains = () => {
  return [
    mainnet,
    optimism,
    pgn,
    { ...fantom, iconUrl: "/logos/fantom-logo.svg" },
  ];
};

export const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  allChains,
  [
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_ID as string }),
    publicProvider(),
  ]
);

/* TODO: remove hardcoded value once we have environment variables validation */
const projectId =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ??
  "2685061cae0bcaf2b244446153eda9e1";

const { wallets } = getDefaultWallets({
  appName: "Grant Explorer",
  projectId,
  chains,
});

// Custom wallet connectors: more can be added by going here:
// https://www.rainbowkit.com/docs/custom-wallet-list
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
