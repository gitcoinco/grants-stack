import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient } from "wagmi";
import {
  fantom as fantomChain,
  fantomTestnet as fantomTestnetChain,
  mainnet,
  arbitrum,
  optimism,
  goerli,
  arbitrumGoerli,
  avalancheFuji as avalancheFujiChain,
  avalanche as avalancheChain,
} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { pgn, pgnTestnet, devChain1, devChain2 } from "common/src/chains";
import { polygon, polygonMumbai } from "@wagmi/core/chains";
import { FantomFTMLogo } from "../assets";

// RPC keys
const alchemyId = process.env.REACT_APP_ALCHEMY_ID!;
const infuraId = process.env.REACT_APP_INFURA_ID!;

export const avalanche: Chain = {
  ...avalancheChain,
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
};

export const avalancheFuji: Chain = {
  ...avalancheFujiChain,
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
};

export const fantom: Chain = {
  ...fantomChain,
  rpcUrls: {
    default: {
      http: ["https://rpcapi.fantom.network/"],
    },
    public: {
      http: ["https://rpcapi.fantom.network/"],
    },
  },
  iconUrl: FantomFTMLogo,
};

export const fantomTestnet: Chain = {
  ...fantomTestnetChain,
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.fantom.network/"],
    },
    public: {
      http: ["https://rpc.testnet.fantom.network/"],
    },
  },
  iconUrl: FantomFTMLogo,
};

const chainsAvailable: Chain[] = [];

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
