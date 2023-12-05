import {
  avalanche,
  avalancheFuji,
  Chain,
  fantom,
  fantomTestnet,
  mainnet,
  optimism,
  polygon,
  polygonMumbai,
  zkSync,
  zkSyncTestnet,
} from "wagmi/chains";
import { arbitrum, arbitrumGoerli } from "viem/chains";
import { pgnTestnet, pgn } from "common/src/chains";

const testnetChains = () => {
  return [
    { ...fantomTestnet, iconUrl: "/logos/fantom-logo.svg" },
    pgnTestnet,
    arbitrumGoerli,
    avalancheFuji,
    polygonMumbai,
    zkSyncTestnet,
  ];
};

const mainnetChains = () => {
  return [
    mainnet,
    optimism,
    pgn,
    arbitrum,
    avalanche,
    polygon,
    zkSync,
    { ...fantom, iconUrl: "/logos/fantom-logo.svg" },
  ];
};

export const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];
