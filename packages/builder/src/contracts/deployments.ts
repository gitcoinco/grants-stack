import { ChainId } from "common";

export const chains = {
  1: "mainnet",
  10: "optimism",
  11155111: "sepolia",
  250: "fantom",
  300: "zkSyncEraTestnet",
  324: "zkSyncEraMainnet",
  424: "pgn",
  4002: "fantomTestnet",
  31337: "localhost",
  313371: "dev1",
  313372: "dev2",
  58008: "pgnTestnet",
  42161: "arbitrum",
  421613: "arbitrumGoerli",
  43114: "avalanche",
  43113: "fuji",
  137: "polygon",
  80001: "polygonMumbai",
  8453: "base",
  534352: "scroll",
  713715: "seiDevnet",
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
  dev1: {
    projectRegistry: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  dev2: {
    projectRegistry: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  localhost: {
    projectRegistry: "0x832c5391dc7931312CbdBc1046669c9c3A4A28d5",
  },
  optimism: {
    projectRegistry: "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174",
  },
  mainnet: {
    projectRegistry: "0x03506eD3f57892C85DB20C36846e9c808aFe9ef4",
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
  avalanche: {
    projectRegistry: "0xDF9BF58Aa1A1B73F0e214d79C652a7dd37a6074e",
  },
  fuji: {
    projectRegistry: "0x8918401DD47f1645fF1111D8E513c0404b84d5bB",
  },
  polygon: {
    projectRegistry: "0x5C5E2D94b107C7691B08E43169fDe76EAAB6D48b",
  },
  polygonMumbai: {
    projectRegistry: "0x545B282A50EaeA01A619914d44105437036CbB36",
  },
  zkSyncEraMainnet: {
    projectRegistry: "0xe6CCEe93c97E20644431647B306F48e278aFFdb9",
  },
  zkSyncEraTestnet: {
    projectRegistry: "0xb0F4882184EB6e3ed120c5181651D50719329788",
  },
  base: {
    projectRegistry: "0xA78Daa89fE9C1eC66c5cB1c5833bC8C6Cb307918",
  },
  scroll: {
    projectRegistry: "0xDF9BF58Aa1A1B73F0e214d79C652a7dd37a6074e",
  },
  sepolia: {
    projectRegistry: "0x2420EABfA2C0e6f77E435B0B7615c848bF4963AF",
  },
  seiDevnet: {
    projectRegistry: "0x5B47c6aFE27b0F5C8319366C6b8FbC0E02104b98",
  },
};

export const addressesByChainID = (chainId: ChainId): DeploymentAddresses => {
  const chainName = chains[chainId];
  return addresses[chainName];
};
