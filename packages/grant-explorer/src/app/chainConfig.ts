import { ChainId } from "common/src/chain-ids";
import { getChains, TChain } from "common";

const ensureValidChainId = (chain: TChain) => {
  if (Object.values(ChainId).includes(chain.id)) {
    return chain;
  } else {
    throw new Error(`Chain id not recognized: ${chain.id}`);
  }
};

const testnetChains = () => {
  return getChains().filter((chain) => chain.type === "testnet");
};

const mainnetChains = () => {
  return getChains().filter((chain) => chain.type === "mainnet");
};

const TESTNET_CHAINS = testnetChains().map(ensureValidChainId);
const MAINNET_CHAINS = mainnetChains().map(ensureValidChainId);

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
