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
import { polygon, polygonMumbai } from "@wagmi/core/chains";

// RPC keys
const alchemyId = process.env.REACT_APP_ALCHEMY_ID!;
const infuraId = process.env.REACT_APP_INFURA_ID!;

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

const enabledChains: Chain[] = [];
const chainsConfig = process.env.REACT_APP_CHAINS;
const selectedChainsNames =
  chainsConfig !== undefined
    ? chainsConfig.split(",").map((name) => name.trim())
    : [];

if (selectedChainsNames.length > 0) {
  // if REACT_APP_CHAINS is specified we use those
  selectedChainsNames.forEach((name) => {
    const chain = availableChains[name];
    if (chain === undefined) {
      throw new Error(
        `availableChains doesn't contain a chain called "${name}"`
      );
    }

    enabledChains.push(chain);
  });
} else if (process.env.REACT_APP_ENV === "production") {
  // if REACT_APP_CHAINS is not specified  ans we are in production
  // we use the default chains for production environments
  enabledChains.push(
    mainnet,
    fantom,
    optimism,
    pgn,
    arbitrum,
    avalanche,
    polygon
  );
} else {
  // if REACT_APP_CHAINS is not specified we use the
  // default chains for staging
  enabledChains.push(
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
    avalancheFuji
  );
}

export const { chains, provider } = configureChains(enabledChains, [
  infuraProvider({ apiKey: infuraId, priority: 0 }),
  alchemyProvider({ apiKey: alchemyId, priority: 1 }),
  publicProvider({ priority: 2 }),
]);

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
