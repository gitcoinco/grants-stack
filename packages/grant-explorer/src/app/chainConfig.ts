import { getChains, TChain } from "common";

const testnetChains = () => {
  return getChains().filter((chain) => chain.type === "testnet");
};

const mainnetChains = () => {
  return getChains().filter((chain) => chain.type === "mainnet");
};

const TESTNET_CHAINS = testnetChains();
const MAINNET_CHAINS = mainnetChains();

export const getEnabledChains = (): TChain[] => {
  switch (process.env.REACT_APP_ENV) {
    case "development":
      return [...TESTNET_CHAINS, ...MAINNET_CHAINS];
    case "production":
      return MAINNET_CHAINS;
    case "test":
      return MAINNET_CHAINS;
    default:
      throw new Error(
        `Unrecognized REACT_APP_ENV: ${process.env.REACT_APP_ENV}`
      );
  }
};
