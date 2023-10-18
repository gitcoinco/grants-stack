import "@rainbow-me/rainbowkit/styles.css";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createClient, configureChains } from "wagmi";
import {
  fantom,
  fantomTestnet,
  mainnet,
  goerli,
  optimism,
  Chain,
  arbitrum,
  arbitrumGoerli,
} from "wagmi/chains";

import { pgn, pgnTestnet } from "common/src/chains";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { alchemyProvider } from "wagmi/providers/alchemy";

const testnetChains = () => {
  return [
    goerli,
    { ...fantomTestnet, iconUrl: "/logos/fantom-logo.svg" },
    pgnTestnet,
    arbitrumGoerli,
  ];
};

const mainnetChains = () => {
  return [
    mainnet,
    optimism,
    pgn,
    arbitrum,
    { ...fantom, iconUrl: "/logos/fantom-logo.svg" },
  ];
};

const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];

/* TODO: remove hardcoded value once we have environment variables validation */
const projectId =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ??
  "2685061cae0bcaf2b244446153eda9e1";
export const { chains, provider, webSocketProvider } = configureChains(
  allChains,
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
