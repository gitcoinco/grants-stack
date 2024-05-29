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
import { alchemyProvider } from "wagmi/providers/alchemy";
import { getEnabledChains } from "./chainConfig";
import { getConfig } from "common/src/config";

const config = getConfig();

const providers = [publicProvider()];
if (config.blockchain.infuraId !== undefined) {
  providers.push(infuraProvider({ apiKey: config.blockchain.infuraId }));
}

if (config.blockchain.alchemyId !== undefined) {
  providers.push(alchemyProvider({ apiKey: config.blockchain.alchemyId }));
}

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  getEnabledChains(),
  providers
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

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: connectors,
  publicClient,
  webSocketPublicClient,
});
