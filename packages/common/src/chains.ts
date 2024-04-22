import { Chain } from "@rainbow-me/rainbowkit";
import {
  avalanche as avalancheOriginal,
  avalancheFuji as avalancheFujiOriginal,
  base as baseOriginal,
  fantom as fantomOriginal,
  fantomTestnet as fantomTestnetOriginal,
  sepolia as ethereumSepolia,
  zkSync as zkSyncOriginal,
} from "@wagmi/chains";
import { ChainId } from "./chain-ids";
import { getConfig } from "./config";
import { error, Result, success } from "./allo/common";

export const PublicGoodsNetworkIcon =
  "https://ipfs.io/ipfs/Qmagrvn2SY5TEoLgqUtcc1745ABZTFoPmod37tW37u7HYo";
export const ZkSyncIcon =
  "https://ipfs.io/ipfs/QmUcGLhpBWRXD3CMbXZQT99adetptxXPqQYA6Pghb4WKSR";
export const BaseLogo =
  "https://ipfs.io/ipfs/QmQaAsfJpUuKmpX3eJEzgdZjqqFWmWHXnDy3MpPVJyDzcj";
export const FantomFTMLogo =
  "https://ipfs.io/ipfs/QmRJgxRqXUpHeskg48qeehUK97FzCAY7espZhTAVdrh9B9";
export const ScrollIcon =
  "https://ipfs.io/ipfs/QmYRA5tXMmGxhw7HUNdr9DYN2GRX3MnLoJVweeWKgfxBZX"; 
export const SeiIcon =
  "https://ipfs.io/ipfs/QmUvNaLwzNf1bHjqTMW1aBjRgd5FrsTDqjSnyypLwxv8x5";

const config = getConfig();

export const fantom: Chain = {
  ...fantomOriginal,
  rpcUrls: {
    default: {
      http: ["https://rpcapi.fantom.network/"],
    },
    public: {
      http: ["https://rpcapi.fantom.network/"],
    },
  },
  iconUrl: FantomFTMLogo,
};

export const fantomTestnet: Chain = {
  ...fantomTestnetOriginal,
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.fantom.network/"],
    },
    public: {
      http: ["https://rpc.testnet.fantom.network/"],
    },
  },
  iconUrl: FantomFTMLogo,
};

export const avalancheFuji: Chain = {
  ...avalancheFujiOriginal,
  rpcUrls: {
    default: {
      http: [
        "https://avalanche-fuji.infura.io/v3/1e0a90928efe4bb78bb1eeceb8aacc27",
      ],
    },
    public: {
      http: ["https://api.avax-test.network/ext/bc/C/rpc"],
    },
  },
};

export const base: Chain = {
  ...baseOriginal,
  iconUrl: BaseLogo,
  rpcUrls: {
    default: {
      http: [
        `https://base-mainnet.g.alchemy.com/v2/${config.blockchain.alchemyId}`,
      ],
    },
    public: {
      http: ["https://mainnet.base.org/"],
    },
  },
};

export const avalanche: Chain = {
  ...avalancheOriginal,
  rpcUrls: {
    default: {
      http: [
        "https://avalanche-mainnet.infura.io/v3/1e0a90928efe4bb78bb1eeceb8aacc27",
      ],
    },
    public: {
      http: ["https://api.avax.network/ext/bc/C/rpc"],
    },
  },
};

export const zkSyncEraTestnet: Chain = {
  id: 300,
  name: "zkSync Era Testnet",
  network: "zksync era testnet",
  iconUrl: ZkSyncIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.era.zksync.dev"],
    },
    public: {
      http: ["https://sepolia.era.zksync.dev"],
    },
  },
};

export const zkSyncEraMainnet: Chain = {
  ...zkSyncOriginal,
  iconUrl: ZkSyncIcon,
  rpcUrls: {
    default: {
      http: ["https://mainnet.era.zksync.io"],
    },
    public: {
      http: ["https://mainnet.era.zksync.io"],
    },
  },
};

export const scroll: Chain = {
  id: 534352,
  name: "Scroll",
  network: "scroll",
  iconUrl: ScrollIcon,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.scroll.io"],
    },
    public: {
      http: ["https://rpc.scroll.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Scrollscan",
      url: "https://scrollscan.com/",
    },
  },
};

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

export const customOptimism = {
  id: 10,
  name: "Optimism",
  network: "optimism",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    alchemy: {
      http: ["https://opt-mainnet.g.alchemy.com/v2/"],
      webSocket: ["wss://opt-mainnet.g.alchemy.com/v2/"],
    },
    infura: {
      http: ["https://optimism-mainnet.infura.io/v3/"],
      webSocket: ["wss://optimism-mainnet.infura.io/ws/v3"],
    },
    default: {
      http: [
        `https://optimism-mainnet.infura.io/v3/${config.blockchain.infuraId}`,
      ],
    },
    public: {
      http: [
        `https://optimism-mainnet.infura.io/v3/${config.blockchain.infuraId}`,
      ],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Etherscan",
      url: "https://optimistic.etherscan.io",
    },
    default: {
      name: "Optimism Explorer",
      url: "https://explorer.optimism.io",
    },
  },
};

export const customPolygon = {
  id: 137,
  name: "Polygon",
  network: "matic",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: {
    alchemy: {
      http: ["https://polygon-mainnet.g.alchemy.com/v2"],
      webSocket: ["wss://polygon-mainnet.g.alchemy.com/v2"],
    },
    infura: {
      http: ["https://polygon-mainnet.infura.io/v3"],
      webSocket: ["wss://polygon-mainnet.infura.io/ws/v3"],
    },
    default: {
      http: [
        `https://polygon-mainnet.infura.io/v3/${config.blockchain.infuraId}`,
      ],
    },
    public: {
      http: [
        `https://polygon-mainnet.infura.io/v3/${config.blockchain.infuraId}`,
      ],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "PolygonScan",
      url: "https://polygonscan.com",
    },
    default: {
      name: "PolygonScan",
      url: "https://polygonscan.com",
    },
  },
};

export const customMainnet = {
  id: 1,
  network: "homestead",
  name: "Ethereum",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    alchemy: {
      http: ["https://eth-mainnet.g.alchemy.com/v2"],
      webSocket: ["wss://eth-mainnet.g.alchemy.com/v2"],
    },
    infura: {
      http: ["https://mainnet.infura.io/v3"],
      webSocket: ["wss://mainnet.infura.io/ws/v3"],
    },
    default: {
      http: [`https://mainnet.infura.io/v3/${config.blockchain.infuraId}`],
    },
    public: {
      http: [`https://mainnet.infura.io/v3/${config.blockchain.infuraId}`],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
  },
};

export const seiDevnet = {
  id: 713715,
  name: "SEI Devnet",
  network: "SEI Devnet",
  iconUrl: SeiIcon,
  nativeCurrency: {
    name: "SEI",
    symbol: "SEI",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://evm-rpc-arctic-1.sei-apis.com"],
    },
    public: {
      http: ["https://evm-rpc-arctic-1.sei-apis.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "SEI Explorer",
      url: "https://seistrace.com/",
    },
  },
};

export const sepolia: Chain = {
  ...ethereumSepolia,
  rpcUrls: {
    default: {
      http: [
        `https://eth-sepolia.g.alchemy.com/v2/${config.blockchain.alchemyId}`,
      ],
    },
    public: {
      http: [
        `https://eth-sepolia.g.alchemy.com/v2/${config.blockchain.alchemyId}`,
      ],
    },
  },
};

export function parseChainIdIntoResult(
  input: string | number
): Result<ChainId> {
  if (typeof input === "string") {
    // If the input is a string, try to parse it as a number
    const parsedInput = parseInt(input, 10);
    if (!isNaN(parsedInput)) {
      // If parsing is successful, check if it's a valid enum value
      if (Object.values(ChainId).includes(parsedInput)) {
        return success(parsedInput as ChainId);
      }
    }
  } else {
    // If the input is a number, check if it's a valid enum value
    if (Object.values(ChainId).includes(input)) {
      return success(input as ChainId);
    }
  }
  return error(new Error("Invalid chainid"));
}

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
    default: { http: ["http://localhost:8545"] },
    public: { http: ["http://localhost:8545"] },
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
    default: { http: ["http://localhost:8546"] },
    public: { http: ["http://localhost:8546"] },
  },
  blockExplorers: {
    default: {
      name: "dev2",
      url: "",
    },
  },
};
