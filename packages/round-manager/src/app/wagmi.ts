import "@rainbow-me/rainbowkit/styles.css";

import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createClient, configureChains, chain } from "wagmi";

import { fantomMainnet, fantomTestnet, pgnTestnet } from "common/src/chains";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { alchemyProvider } from "wagmi/providers/alchemy";

const testnetChains = () => {
  return [chain.goerli, fantomTestnet, pgnTestnet];
};

const mainnetChains = () => {
  return [chain.mainnet, chain.optimism, fantomMainnet];
};

const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];

export const { chains, provider, webSocketProvider } = configureChains(
  allChains,
  [
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_ID, priority: 0 }),
    alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_ID, priority: 1 }),
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
      walletConnectWallet({ chains }),
      coinbaseWallet({ appName: "Gitcoin Round Manager", chains }),
      metaMaskWallet({ chains }),
    ],
  },
]);

export const client = createClient({
  autoConnect: true,
  connectors: connectors,
  provider,
  webSocketProvider,
});
