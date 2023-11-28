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
import { pgnTestnet, pgn } from "common/src/chains";

const getTestnetChains = () => {
  return [
    { ...fantomTestnet, iconUrl: "/logos/fantom-logo.svg" },
    pgnTestnet,
    arbitrumGoerli,
    avalancheFuji,
    polygonMumbai,
  ];
};

const getMainnetChains = () => {
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

export const getActiveChains = (): Chain[] => {
  switch (process.env.REACT_APP_ENV) {
    case "development":
      return [...getTestnetChains(), ...getMainnetChains()];
    case "production":
      return getMainnetChains();
    case "test":
      return getMainnetChains();
    default:
      throw new Error(
        `Unrecognized REACT_APP_ENV: ${process.env.REACT_APP_ENV}`
      );
  }
};
