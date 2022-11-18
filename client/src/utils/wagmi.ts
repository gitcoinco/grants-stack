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

// RPC keys
const alchemyId = process.env.ALCHEMY_ID;
const infuraId = process.env.INFURA_ID;

const chainsAvailable: Chain[] = [];

// Adding custom chain setups for Fantom Mainnet and Testnet
const fantomTestnet: Chain = {
  id: 4002,
  name: "Fantom Testnet",
  network: "fantom testnet",
  iconUrl:
    "https://ipfs.io/ipfs/Qmf3a8sPpk8TM4x2aFCyb14SAmn2RZehiDFP7HhFMD1oLK?filename=ftm-testnet.png",
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
    "https://ipfs.io/ipfs/QmRJgxRqXUpHeskg48qeehUK97FzCAY7espZhTAVdrh9B9?filename=fantom-ftm-logo.png",
  nativeCurrency: {
    decimals: 18,
    name: "Fantom",
    symbol: "FTM",
  },
  rpcUrls: {
    default: "https://rpc.ftm.tools/",
  },
  blockExplorers: {
    default: { name: "ftmscan", url: "https://ftmscan.com" },
  },
  testnet: false,
};

// todo: fix for rpc issue is with hardhat local chain calling rpc
if (process.env.REACT_APP_LOCALCHAIN) {
  chainsAvailable.push(chain.hardhat);
}

if (process.env.REACT_APP_ENV === "production") {
  chainsAvailable.push(fantomMainnet, chain.optimism);
} else {
  chainsAvailable.push(
    chain.optimism,
    chain.goerli,
    fantomTestnet,
    fantomMainnet
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
      walletConnectWallet({ chains }),
      coinbaseWallet({ appName: "Grants Hub", chains }),
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
