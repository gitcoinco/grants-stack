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
} from "wagmi/chains";
import { arbitrum, arbitrumGoerli } from "viem/chains";
import {
  pgnTestnet,
  pgn,
  zkSyncEraMainnet,
  zkSyncEraTestnet,
} from "common/src/chains";

const testnetChains = () => {
  return [
    { ...fantomTestnet, iconUrl: "/logos/fantom-logo.svg" },
    pgnTestnet,
    arbitrumGoerli,
    avalancheFuji,
    polygonMumbai,
    zkSyncEraTestnet,
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
    zkSyncEraMainnet,
    { ...fantom, iconUrl: "/logos/fantom-logo.svg" },
  ];
};

export const allChains: Chain[] =
  process.env.REACT_APP_ENV === "development"
    ? [...testnetChains(), ...mainnetChains()]
    : [...mainnetChains()];
