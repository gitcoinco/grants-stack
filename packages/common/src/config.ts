import { z } from "zod";
import { ChainId } from "./chain-ids";

const trueStrings = ["1", "t", "T", "TRUE", "true", "True"];

// remove after this PR is merged: https://github.com/colinhacks/zod/pull/2989
function parseStringToBoolean(value: string) {
  if (trueStrings.includes(value)) {
    return true;
  }

  return false;
}

export type Config = {
  appEnv: "development" | "test" | "production";
  ipfs: {
    baseUrl: string;
  };
  dataLayer: {
    searchServiceBaseUrl: string;
    subgraphEndpoints: Record<number, string>;
  };
  pinata: {
    jwt: string;
    baseUrl: string;
  };
  blockchain: {
    chainsOverride: string | undefined;
    alchemyId: string | undefined;
    infuraId: string | undefined;
  };
  explorer: {
    disableEstimates: boolean;
  };
};

let config: Config | null = null;

export function getConfig(): Config {
  if (config !== null) {
    return config;
  }

  config = {
    appEnv: z
      .enum(["development", "test", "production"])
      .default("development")
      .parse(process.env.REACT_APP_ENV),
    ipfs: {
      baseUrl: z
        .string()
        .url()
        .default("https://local-ipfs.dev")
        .parse(process.env.REACT_APP_IPFS_BASE_URL),
    },
    dataLayer: {
      searchServiceBaseUrl: z
        .string()
        .url()
        .parse(process.env.REACT_APP_GRANTS_STACK_SEARCH_API_BASE_URL),
      subgraphEndpoints: {
        [ChainId.DEV1]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_DEV1_API),
        [ChainId.DEV2]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_DEV2_API),
        [ChainId.PGN]: z.string().parse(process.env.REACT_APP_SUBGRAPH_PGN_API),
        [ChainId.PGN_TESTNET]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_PGN_TESTNET_API),
        [ChainId.MAINNET]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_MAINNET_API),
        [ChainId.OPTIMISM_MAINNET_CHAIN_ID]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API),
        [ChainId.FANTOM_MAINNET_CHAIN_ID]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_FANTOM_MAINNET_API),
        [ChainId.FANTOM_TESTNET_CHAIN_ID]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_FANTOM_TESTNET_API),
        [ChainId.ARBITRUM_GOERLI]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_ARBITRUM_GOERLI_API),
        [ChainId.ARBITRUM]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_ARBITRUM_API),
        [ChainId.FUJI]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_FUJI_API),
        [ChainId.AVALANCHE]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_AVALANCHE_API),
        [ChainId.POLYGON]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_POLYGON_API),
        [ChainId.POLYGON_MUMBAI]: z
          .string()
          .parse(process.env.REACT_APP_SUBGRAPH_POLYGON_MUMBAI_API),
      },
    },
    pinata: {
      jwt: z
        .string()
        .min(1)
        .default("test-token")
        .parse(process.env.REACT_APP_PINATA_JWT),
      baseUrl: z
        .string()
        .url()
        .default("https://local-pinata.dev")
        .parse(process.env.REACT_APP_PINATA_BASE_URL),
    },
    blockchain: {
      chainsOverride: z
        .string()
        .optional()
        .parse(process.env.REACT_APP_CHAINS_OVERRIDE),
      alchemyId: z.string().optional().parse(process.env.REACT_APP_ALCHEMY_ID),
      infuraId: z.string().optional().parse(process.env.REACT_APP_INFURA_ID),
    },
    explorer: {
      disableEstimates: parseStringToBoolean(
        z
          .string()
          .optional()
          .default("false")
          .parse(process.env.REACT_APP_EXPLORER_DISABLE_MATCHING_ESTIMATES)
      ),
    },
  };

  return config;
}
