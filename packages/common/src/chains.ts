import { Chain } from "@rainbow-me/rainbowkit";
import PublicGoodsNetworkIcon from "./icons/PublicGoodsNetwork.svg";

export enum ChainId {
  MAINNET = 1,
  GOERLI_CHAIN_ID = 5,
  OPTIMISM_MAINNET_CHAIN_ID = 10,
  FANTOM_MAINNET_CHAIN_ID = 250,
  FANTOM_TESTNET_CHAIN_ID = 4002,
  PGN = 424,
  PGN_TESTNET = 58008,
  ARBITRUM = 42161,
  ARBITRUM_GOERLI = 421613,
  AVALANCHE = 43114,
  FUJI = 43113,
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  DEV = 313371,
}

/**
 * Attempts to parse a numerical or string chainId to the Enum.
 * returns null if the chainid is invalid */
export function tryParseChainIdToEnum(
  chainId: string | number
): ChainId | null {
  const chains = Object.keys(ChainId)
    .map(Number)
    .filter((item) => {
      return !isNaN(item);
    });
  const chainIdEnumValue = chains.find((chain) => chain === chainId);
  if (chainIdEnumValue === undefined) {
    return null;
  }
  return chainIdEnumValue as ChainId;
}

export const pgnTestnet: Chain = {
  id: 58008,
  name: "PGN Testnet",
  network: "pgn testnet",
  iconUrl: PublicGoodsNetworkIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.publicgoods.network"],
    },
    public: {
      http: ["https://sepolia.publicgoods.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "pgnscan",
      url: "https://explorer.sepolia.publicgoods.network",
    },
  },
  testnet: true,
};

export const pgn: Chain = {
  id: 424,
  name: "PGN",
  network: "pgn",
  iconUrl: PublicGoodsNetworkIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.publicgoods.network"],
    },
    public: {
      http: ["https://rpc.publicgoods.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "pgnscan",
      url: "https://explorer.publicgoods.network",
    },
  },
};

export function parseChainId(input: string | number): ChainId {
  if (typeof input === "string") {
    // If the input is a string, try to parse it as a number
    const parsedInput = parseInt(input, 10);
    if (!isNaN(parsedInput)) {
      // If parsing is successful, check if it's a valid enum value
      if (Object.values(ChainId).includes(parsedInput)) {
        return parsedInput as ChainId;
      }
    }
  } else if (typeof input === "number") {
    // If the input is a number, check if it's a valid enum value
    if (Object.values(ChainId).includes(input)) {
      return input as ChainId;
    }
  }

  // If the input is not a valid enum value, return undefined
  throw "Invalid chainId " + input;
}

export const devChain1: Chain = {
  id: 313371,
  name: "Development 1",
  network: "dev1",
  iconUrl: PublicGoodsNetworkIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://localhost:3005"] },
    public: { http: ["http://localhost:3005"] },
  },
  blockExplorers: {
    default: {
      name: "dev1",
      url: "",
    },
  },
};

export const devChain2: Chain = {
  id: 313372,
  name: "Development 2",
  network: "dev2",
  iconUrl: PublicGoodsNetworkIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://localhost:3007"] },
    public: { http: ["http://localhost:3007"] },
  },
  blockExplorers: {
    default: {
      name: "dev2",
      url: "",
    },
  },
};
