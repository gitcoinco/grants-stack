import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { chain, configureChains, createClient } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

// RPC keys
const alchemyId = process.env.ALCHEMY_ID;
const infuraId = process.env.INFURA_ID;

const chainsAvailable: Chain[] = [];

const fantomTestnet: Chain = {
  id: 4002,
  name: "Fantom Testnet",
  network: "fantom testnet",
  iconUrl: "https://fantomrock.com/img/tokens/0.png",
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
  iconUrl:
    "https://ipfs.io/ipns/k51qzi5uqu5di9fpr1u08putyfwqdzwue8dbxq0047mid8hj85hfetm9bw71tv",
  nativeCurrency: {
    decimals: 18,
    name: "Fantom",
    symbol: "FTM",
  },
  rpcUrls: {
    default: "https://rpc.ankr.com/fantom/",
  },
  blockExplorers: {
    default: { name: "ftmscan", url: "https://ftmscan.com" },
  },
  testnet: false,
};

if (process.env.REACT_APP_LOCALCHAIN) {
  chainsAvailable.push(chain.hardhat);
}

if (process.env.REACT_APP_ENV === "production") {
  chainsAvailable.push(
    chain.optimism,
    chain.goerli,
    chain.optimismKovan,
    fantomMainnet
  );
} else {
  chainsAvailable.push(
    chain.optimism,
    chain.goerli,
    chain.optimismKovan,
    fantomTestnet,
    fantomMainnet
  );
}

export const { chains, provider } = configureChains(chainsAvailable, [
  infuraProvider({ apiKey: infuraId, priority: 0 }),
  alchemyProvider({ apiKey: alchemyId, priority: 1 }),
  publicProvider({ priority: 2 }),
]);

// todo: remove rainbow wallet option
const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      walletConnectWallet({ chains }),
      coinbaseWallet({ appName: "Grant Hub", chains }),
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
