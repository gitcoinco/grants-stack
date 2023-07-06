import { Chain } from "@rainbow-me/rainbowkit";
import PublicGoodsNetworkIcon from "./icons/PublicGoodsNetwork.svg";

/***********************/
/* == Custom Chains == */
/***********************/

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
    default: "https://sepolia.publicgoods.network",
  },
  blockExplorers: {
    default: {
      name: "pgnscan",
      url: "https://explorer.sepolia.publicgoods.network",
    },
  },
  testnet: true,
};

// Fantom Mainnet
export const fantomMainnet: Chain = {
  id: 250,
  name: "Fantom",
  network: "fantom mainnet",
  iconUrl:
    "https://gitcoin.mypinata.cloud/ipfs/bafkreih3k2dxplvtgbdpj43j3cxjpvkkwuoxm2fbvthzlingucv6ncauaa",
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

// Fantom Testnet
export const fantomTestnet: Chain = {
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
