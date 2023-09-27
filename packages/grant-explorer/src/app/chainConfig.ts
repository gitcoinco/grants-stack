import {
  avalanche,
  avalancheFuji,
  Chain,
  fantom,
  fantomTestnet,
  goerli,
  mainnet,
  optimism,
  polygon,
  polygonMumbai,
} from "wagmi/chains";
import { arbitrum, arbitrumGoerli } from "viem/chains";
import { pgnTestnet, pgn } from "common/src/chains";

const testnetChains = () => {
  return [
    goerli,
    { ...fantomTestnet, iconUrl: "/logos/fantom-logo.svg" },
    pgnTestnet,
    arbitrumGoerli,
    avalancheFuji,
    polygonMumbai,
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
    { ...fantom, iconUrl: "/logos/fantom-logo.svg" },
  ];
};

export const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];
