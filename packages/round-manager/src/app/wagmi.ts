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
import { zeroAddress } from "viem";

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

/* TODO: remove hardcoded value once we have environment variables validation */
const projectId =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ??
  "2685061cae0bcaf2b244446153eda9e1";
export const { chains, provider, webSocketProvider } = configureChains(
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
