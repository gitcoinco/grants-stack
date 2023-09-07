import { ChainId } from "common";

export const chains = {
  1: "mainnet",
  5: "goerli",
  10: "optimism",
  250: "fantom",
  424: "pgn",
  4002: "fantomTestnet",
  31337: "localhost",
  58008: "pgnTestnet",
  42161: "arbitrum",
  421613: "arbitrumGoerli",
} as const;

export type ChainName = (typeof chains)[keyof typeof chains];

export type DeploymentAddress = {
  [key in ChainName]: {
    projectRegistry: string | undefined;
  };
};

type DeploymentAddresses = {
  projectRegistry: string | undefined;
};

export type DeploymentAddressesMap = {
  [key in ChainName]: DeploymentAddresses;
};

export const addresses: DeploymentAddressesMap = {
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
  pgn: {
    projectRegistry: "0xDF9BF58Aa1A1B73F0e214d79C652a7dd37a6074e",
  },
  pgnTestnet: {
    projectRegistry: "0x6294bed5B884Ae18bf737793Ef9415069Bf4bc11",
  },
  arbitrum: {
    projectRegistry: "0x73AB205af1476Dc22104A6B8b3d4c273B58C6E27",
  },
  arbitrumGoerli: {
    projectRegistry: "0x0CD135777dEaB6D0Bb150bDB0592aC9Baa4d0871",
  },
};

export const addressesByChainID = (chainId: ChainId): DeploymentAddresses => {
  const chainName = chains[chainId];
  return addresses[chainName];
};
