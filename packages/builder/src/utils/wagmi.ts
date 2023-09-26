import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient } from "wagmi";
import {
  fantom,
  fantomTestnet,
  mainnet,
  arbitrum,
  optimism,
  goerli,
  arbitrumGoerli,
  hardhat,
} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import PublicGoodsNetworkIcon from "common/src/icons/PublicGoodsNetwork.svg";
import { polygon, polygonMumbai } from "@wagmi/core/chains";

// RPC keys
const alchemyId = process.env.REACT_APP_ALCHEMY_ID!;
const infuraId = process.env.REACT_APP_INFURA_ID!;

export const avalanche: Chain = {
  id: 43114,
  name: "Avalanche",
  network: "avalanche",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: {
      http: [
        "https://avalanche-mainnet.infura.io/v3/1e0a90928efe4bb78bb1eeceb8aacc27",
      ],
    },
    public: {
      http: ["https://api.avax.network/ext/bc/C/rpc"],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "SnowTrace",
      url: "https://snowtrace.io",
    },
    default: {
      name: "SnowTrace",
      url: "https://snowtrace.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 11907934,
    },
  },
};

export const avalancheFuji: Chain = {
  id: 43113,
  name: "Avalanche Fuji",
  network: "avalanche-fuji",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: {
      http: [
        "https://avalanche-fuji.infura.io/v3/1e0a90928efe4bb78bb1eeceb8aacc27",
      ],
    },
    public: {
      http: ["https://api.avax-test.network/ext/bc/C/rpc"],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "SnowTrace",
      url: "https://testnet.snowtrace.io",
    },
    default: {
      name: "SnowTrace",
      url: "https://testnet.snowtrace.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 7096959,
    },
  },
  testnet: true,
};

export const pgn: Chain = {
  id: 424,
  name: "PGN",
  network: "pgn",
  iconUrl: PublicGoodsNetworkIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["https://rpc.publicgoods.network"] },
    public: { http: ["https://rpc.publicgoods.network"] },
  },
  blockExplorers: {
    default: {
      name: "pgnscan",
      url: "https://explorer.publicgoods.network",
    },
  },
};

const chainsAvailable: Chain[] = [];
export const pgnTestnet: Chain = {
  id: 58008,
  name: "PGN Testnet",
  network: "pgn testnet",
  iconUrl: PublicGoodsNetworkIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["https://sepolia.publicgoods.network"] },
    public: { http: ["https://sepolia.publicgoods.network"] },
  },
  blockExplorers: {
    default: {
      name: "pgnscan",
      url: "https://explorer.sepolia.publicgoods.network",
    },
  },
  testnet: true,
};

// todo: fix for rpc issue is with hardhat local chain calling rpc
if (process.env.REACT_APP_LOCALCHAIN === "true") {
  chainsAvailable.push(hardhat);
}

if (process.env.REACT_APP_ENV === "production") {
  chainsAvailable.push(
    mainnet,
    fantom,
    optimism,
    pgn,
    arbitrum,
    avalanche,
    polygon
  );
} else {
  chainsAvailable.push(
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

export const { chains, provider } = configureChains(chainsAvailable, [
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
