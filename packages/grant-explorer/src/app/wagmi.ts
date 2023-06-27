import "@rainbow-me/rainbowkit/styles.css";

import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createClient, configureChains, chain } from "wagmi";
import { pgnTestnet } from "common/src/chains";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";

const testnetChains = () => {
  /***********************/
  /* == Custom Chains == */
  /***********************/

  // Fantom Testnet
  const fantomTestnet: Chain = {
    id: 4002,
    name: "Fantom Testnet",
    network: "fantom testnet",
    iconUrl:
      "https://gitcoin.mypinata.cloud/ipfs/bafkreih3k2dxplvtgbdpj43j3cxjpvkkwuoxm2fbvthzlingucv6ncauaa",
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

  return [chain.goerli, fantomTestnet, pgnTestnet];
};

const mainnetChains = () => {
  /***********************/
  /* == Custom Chains == */
  /***********************/

  // Fantom Mainnet
  // const fantomMainnet: Chain = {
  //   id: 250,
  //   name: "Fantom",
  //   network: "fantom mainnet",
  //   iconUrl:
  //     "https://gitcoin.mypinata.cloud/ipfs/bafkreih3k2dxplvtgbdpj43j3cxjpvkkwuoxm2fbvthzlingucv6ncauaa",
  //   nativeCurrency: {
  //     decimals: 18,
  //     name: "Fantom",
  //     symbol: "FTM",
  //   },
  //   rpcUrls: {
  //     default: "https://rpc.ankr.com/fantom/",
  //   },
  //   blockExplorers: {
  //     default: { name: "ftmscan", url: "https://ftmscan.com" },
  //   },
  //   testnet: false,
  // };

  // return [chain.mainnet, chain.optimism, fantomMainnet];
  return [chain.mainnet, chain.optimism];
};

const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];

export const { chains, provider, webSocketProvider } = configureChains(
  allChains,
  [
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_ID }),
    publicProvider(),
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
      coinbaseWallet({ appName: "Gitcoin Explorer", chains }),
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
