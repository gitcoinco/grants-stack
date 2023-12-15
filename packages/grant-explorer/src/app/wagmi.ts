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

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  getEnabledChains(),
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
