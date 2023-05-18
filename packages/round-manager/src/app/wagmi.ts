import "@rainbow-me/rainbowkit/styles.css";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, mainnet, configureChains } from "wagmi";

import { infuraProvider } from "wagmi/providers/infura";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { fantom, fantomTestnet, goerli, optimism } from "viem/chains";
import { publicProvider } from "@wagmi/core/providers/public";

const testnetChains = () => {
  return [goerli, fantomTestnet];
};

const mainnetChains = () => {
  return [mainnet, optimism, fantom];
};

const allChains =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  allChains,
  [
    infuraProvider({
      apiKey: process.env.REACT_APP_INFURA_ID as string,
    }),
    alchemyProvider({
      apiKey: process.env.REACT_APP_ALCHEMY_ID as string,
    }),
    publicProvider(),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ chains }),
      coinbaseWallet({ appName: "Gitcoin Round Manager", chains }),
      metaMaskWallet({ chains }),
    ],
  },
]);

export const client = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});
