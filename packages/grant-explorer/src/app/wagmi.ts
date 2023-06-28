import "@rainbow-me/rainbowkit/styles.css";

import {
  connectorsForWallets,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { mainnet, goerli, fantomTestnet, optimism } from "wagmi/chains";
import { createClient, configureChains, Chain } from "wagmi";

import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";

const testnetChains = () => {
  /***********************/
  /* == Custom Chains == */
  /***********************/

  return [goerli, fantomTestnet];
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
  return [mainnet, optimism];
};

const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];

export const { chains, provider, webSocketProvider } = configureChains(
  allChains,
  [
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_ID as string }),
    publicProvider(),
  ]
);

const projectId = "2685061cae0bcaf2b244446153eda9e1";

const { wallets } = getDefaultWallets({
  appName: "Grant Explorer",
  projectId,
  chains,
});

// Custom wallet connectors: more can be added by going here:
// https://www.rainbowkit.com/docs/custom-wallet-list
const connectors = connectorsForWallets([
  {
    ...wallets,
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains, projectId }),
      walletConnectWallet({ chains, projectId }),
      coinbaseWallet({ appName: "Gitcoin Explorer", chains }),
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
