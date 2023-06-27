import { ChainId } from "common";

export const chains = {
  1: "mainnet",
  5: "goerli",
  10: "optimism",
  250: "fantom",
  4002: "fantomTestnet",
  31337: "localhost",
  58008: "pgnTestnet",
} as const;

export type ChainName = (typeof chains)[keyof typeof chains];

export type DeploymentAddress = {
  [key in ChainName]: {
    projectRegistry: string | undefined;
  };
};

export const addresses: DeploymentAddress = {
  localhost: {
    projectRegistry: "0x832c5391dc7931312CbdBc1046669c9c3A4A28d5",
  },
  optimism: {
    projectRegistry: "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174",
  },
  mainnet: {
    projectRegistry: "0x03506eD3f57892C85DB20C36846e9c808aFe9ef4",
  },
  goerli: {
    projectRegistry: "0xa71864fAd36439C50924359ECfF23Bb185FFDf21",
  },
  fantomTestnet: {
    projectRegistry: "0x984749e408FF0446d8ADaf20E293F2F299396631",
  },
  fantom: {
    projectRegistry: "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174",
  },
  pgnTestnet: {
    projectRegistry: "0x6294bed5B884Ae18bf737793Ef9415069Bf4bc11",
  },
};

export const addressesByChainID = (chainID: ChainId) => {
  const chainName = chains[chainID];
  return addresses[chainName];
};
