import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient, Chain } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { pgnTestnet } from "common/src/chains";
import {
  fantom,
  fantomTestnet,
  optimism,
  mainnet,
  hardhat,
  goerli,
} from "wagmi/chains";

// RPC keys
const alchemyId = process.env.REACT_APP_ALCHEMY_ID as string;
const infuraId = process.env.REACT_APP_INFURA_ID as string;

const chainsAvailable: Chain[] = [];

// todo: fix for rpc issue is with hardhat local chain calling rpc
if (process.env.REACT_APP_LOCALCHAIN) {
  chainsAvailable.push(hardhat);
}

if (process.env.REACT_APP_ENV === "production") {
  chainsAvailable.push(mainnet, fantom, optimism);
} else {
  chainsAvailable.push(
    optimism,
    goerli,
    fantomTestnet,
    fantom,
    mainnet,
    pgnTestnet
  );
}

export const { chains, provider } = configureChains(chainsAvailable, [
  infuraProvider({ apiKey: infuraId, priority: 0 }),
  alchemyProvider({ apiKey: alchemyId, priority: 1 }),
  publicProvider({ priority: 2 }),
]);

/* TODO: remove hardcoded value once we have environment variables validation */
const projectId =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ??
  "2685061cae0bcaf2b244446153eda9e1";

// Custom wallet connectors: more can be added by going here:
// https://www.rainbowkit.com/docs/custom-wallet-list
const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ chains, projectId }),
      coinbaseWallet({ appName: "Builder", chains }),
      metaMaskWallet({ chains, projectId }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default wagmiClient;
