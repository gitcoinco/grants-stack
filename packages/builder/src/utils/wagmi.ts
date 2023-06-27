import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { chain, configureChains, createClient } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { pgnTestnet } from "common/src/chains";
import { FantomFTMLogo, FTMTestnet, OPIcon } from "../assets";

const ftmTestnetIcon = FTMTestnet;
const ftmMainnetIcon = FantomFTMLogo;

// RPC keys
const alchemyId = process.env.REACT_APP_ALCHEMY_ID;
const infuraId = process.env.REACT_APP_INFURA_ID;

const chainsAvailable: Chain[] = [];

// Adding custom chain setups for Fantom Mainnet and Testnet
const fantomTestnet: Chain = {
  id: 4002,
  name: "Fantom Testnet",
  network: "fantom testnet",
  iconUrl: ftmTestnetIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Fantom",
    symbol: "FTM",
  },
  rpcUrls: {
    default: "https://rpc.testnet.fantom.network/",
  },
  blockExplorers: {
    default: { name: "ftmscan", url: "https://testnet.ftmscan.com" },
  },
  testnet: true,
};

const fantomMainnet: Chain = {
  id: 250,
  name: "Fantom",
  network: "fantom mainnet",
  iconUrl: ftmMainnetIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Fantom",
    symbol: "FTM",
  },
  rpcUrls: {
    default: "https://rpcapi.fantom.network/",
  },
  blockExplorers: {
    default: { name: "ftmscan", url: "https://ftmscan.com" },
  },
  testnet: false,
};

const optimismMainnet: Chain = {
  id: 10,
  name: "Optimism",
  network: "optimism mainnet",
  iconUrl: OPIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Optimism",
    symbol: "ETH",
  },
  rpcUrls: {
    default: `https://opt-mainnet.g.alchemy.com/v2/${alchemyId}`,
  },
  blockExplorers: {
    default: { name: "etherscan", url: "https://optimistic.etherscan.io" },
  },
  testnet: false,
};

// todo: fix for rpc issue is with hardhat local chain calling rpc
if (process.env.REACT_APP_LOCALCHAIN) {
  chainsAvailable.push(chain.hardhat);
}

if (process.env.REACT_APP_ENV === "production") {
  chainsAvailable.push(chain.mainnet, fantomMainnet, optimismMainnet);
} else {
  chainsAvailable.push(
    optimismMainnet,
    chain.goerli,
    fantomTestnet,
    fantomMainnet,
    chain.mainnet,
    pgnTestnet
  );
}

export const { chains, provider } = configureChains(chainsAvailable, [
  infuraProvider({ apiKey: infuraId, priority: 0 }),
  alchemyProvider({ apiKey: alchemyId, priority: 1 }),
  publicProvider({ priority: 2 }),
]);
console.log(chainsAvailable);
// Custom wallet connectors: more can be added by going here:
// https://www.rainbowkit.com/docs/custom-wallet-list
const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ chains }),
      coinbaseWallet({ appName: "Builder", chains }),
      metaMaskWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default wagmiClient;
