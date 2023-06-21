import { ethers } from "ethers";
import { IPFSObject, PayoutToken } from "./types";
import { RedstoneTokenIds } from "common";
import { useSearchParams } from "react-router-dom";

export function useDebugMode(): boolean {
  const [searchParams] = useSearchParams();

  return (
    (process.env.REACT_APP_ALLOW_URL_DEBUG_MODE === "true" &&
      searchParams.get("debug") === "true") ||
    process.env.REACT_APP_DEBUG_MODE === "true"
  );
}

export enum ChainId {
  MAINNET = "1",
  GOERLI_CHAIN_ID = "5",
  OPTIMISM_MAINNET_CHAIN_ID = "10",
  FANTOM_MAINNET_CHAIN_ID = "250",
  FANTOM_TESTNET_CHAIN_ID = "4002",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CHAINS: Record<number, any> = {
  [ChainId.MAINNET]: {
    id: ChainId.MAINNET,
    name: "Mainnet",
    logo: "./logos/ethereum-eth-logo.svg",
  },
  [ChainId.GOERLI_CHAIN_ID]: {
    id: ChainId.GOERLI_CHAIN_ID,
    name: "Goerli",
    logo: "./logos/ethereum-eth-logo.svg",
  },
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]: {
    id: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    name: "Optimism",
    logo: "./logos/optimism-logo.svg",
  },
  [ChainId.FANTOM_MAINNET_CHAIN_ID]: {
    id: ChainId.FANTOM_MAINNET_CHAIN_ID,
    name: "Fantom",
    logo: "./logos/fantom-logo.svg",
  },
  [ChainId.FANTOM_TESTNET_CHAIN_ID]: {
    id: ChainId.FANTOM_TESTNET_CHAIN_ID,
    name: "Fantom Testnet",
    logo: "./logos/fantom-logo.svg",
  },
};

export const TokenNamesAndLogos: Record<string, string> = {
  FTM: "./logos/fantom-logo.svg",
  BUSD: "./logos/busd-logo.svg",
  DAI: "./logos/dai-logo.svg",
  ETH: "./logos/ethereum-eth-logo.svg",
  OP: "./logos/optimism-logo.svg",
};

const MAINNET_TOKENS: PayoutToken[] = [
  {
    name: "DAI",
    chainId: ChainId.MAINNET,
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
  {
    name: "ETH",
    chainId: ChainId.MAINNET,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
];

const OPTIMISM_MAINNET_TOKENS: PayoutToken[] = [
  {
    name: "DAI",
    chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
  {
    name: "ETH",
    chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
];

const FANTOM_MAINNET_TOKENS: PayoutToken[] = [
  {
    name: "WFTM",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    decimal: 18,
    logo: TokenNamesAndLogos["FTM"],
    redstoneTokenId: RedstoneTokenIds["FTM"],
  },
  {
    name: "FTM",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["FTM"],
    redstoneTokenId: RedstoneTokenIds["FTM"],
  },
  {
    name: "BUSD",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50",
    decimal: 18,
    logo: TokenNamesAndLogos["BUSD"],
    redstoneTokenId: RedstoneTokenIds["BUSD"],
  },
  {
    name: "DAI",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
];

const GOERLI_TESTNET_TOKENS: PayoutToken[] = [
  {
    name: "BUSD",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: "0xa7c3bf25ffea8605b516cf878b7435fe1768c89b",
    decimal: 18,
    logo: TokenNamesAndLogos["BUSD"],
    redstoneTokenId: RedstoneTokenIds["BUSD"],
  },
  {
    name: "DAI",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
  {
    name: "ETH",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
  },
];

const FANTOM_TESTNET_TOKENS: PayoutToken[] = [
  {
    name: "DAI",
    chainId: ChainId.FANTOM_TESTNET_CHAIN_ID,
    address: "0xEdE59D58d9B8061Ff7D22E629AB2afa01af496f4",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
  },
];

export const payoutTokens = [
  ...MAINNET_TOKENS,
  ...OPTIMISM_MAINNET_TOKENS,
  ...FANTOM_MAINNET_TOKENS,
  ...GOERLI_TESTNET_TOKENS,
  ...FANTOM_TESTNET_TOKENS,
];

export const getPayoutTokenOptions = (chainId: string): PayoutToken[] => {
  switch (chainId) {
    case ChainId.MAINNET: {
      return MAINNET_TOKENS;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      return OPTIMISM_MAINNET_TOKENS;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      return FANTOM_MAINNET_TOKENS;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      return FANTOM_TESTNET_TOKENS;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      return GOERLI_TESTNET_TOKENS;
    }
  }
};

/**
 * Fetch subgraph network for provided web3 network
 *
 * @param chainId - The chain ID of the blockchain2
 * @returns the subgraph endpoint
 */
const getGraphQLEndpoint = async (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.MAINNET:
      return `${process.env.REACT_APP_SUBGRAPH_MAINNET_API}`;

    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`;

    case ChainId.FANTOM_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_FANTOM_MAINNET_API}`;

    case ChainId.FANTOM_TESTNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_FANTOM_TESTNET_API}`;

    case ChainId.GOERLI_CHAIN_ID:
    default:
      return `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`;
  }
};

/**
 * Fetch the correct transaction explorer for the provided web3 network
 *
 * @param chainId - The chain ID of the blockchain
 * @param txHash - The transaction hash
 * @returns the transaction explorer URL for the provided transaction hash and network
 */
export const getTxExplorer = (chainId?: ChainId | number, txHash?: string) => {
  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
    case 10:
      return `https://optimistic.etherscan.io/tx/${txHash}`;

    case ChainId.FANTOM_MAINNET_CHAIN_ID:
    case 250:
      return `https://ftmscan.com/tx/${txHash}`;

    case ChainId.FANTOM_TESTNET_CHAIN_ID:
    case 4002:
      return `https://testnet.ftmscan.com/tx/${txHash}`;

    case ChainId.MAINNET:
    case 1:
      return `https://etherscan.io/tx/${txHash}`;

    default:
      return `https://goerli.etherscan.io/tx/${txHash}`;
  }
};

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param query - The query to be executed
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param variables - The variables to be used in the query
 * @param fromProjectRegistry - Override to fetch from grant hub project registry subgraph
 * @returns The result of the query
 */
export const graphql_fetch = async (
  query: string,
  chainId: ChainId,
  // eslint-disable-next-line @typescript-eslint/ban-types
  variables: object = {},
  fromProjectRegistry = false
) => {
  let endpoint = await getGraphQLEndpoint(chainId);

  if (fromProjectRegistry) {
    endpoint = endpoint.replace("grants-round", "grants-hub");
  }

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  }).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp);
  });
};

/**
 * Fetch data from IPFS
 *
 * @param cid - the unique content identifier that points to the data
 */
export const fetchFromIPFS = (cid: string) => {
  return fetch(
    `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`
  ).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp);
  });
};

/**
 * Pin data to IPFS
 * The data could either be a file or a JSON object
 *
 * @param obj - the data to be pinned on IPFS
 * @returns the unique content identifier that points to the data
 */
export const pinToIPFS = (obj: IPFSObject) => {
  const params = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
    },
    body: {
      pinataMetadata: obj.metadata,
      pinataOptions: {
        cidVersion: 1,
      },
    },
  };

  /* typeof Blob === 'object', so we need to check against instanceof */
  if (obj.content instanceof Blob) {
    // content is a blob
    const fd = new FormData();
    fd.append("file", obj.content as Blob);
    fd.append("pinataOptions", JSON.stringify(params.body.pinataOptions));
    fd.append("pinataMetadata", JSON.stringify(params.body.pinataMetadata));

    return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      ...params,
      body: fd,
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  } else {
    // content is a JSON object
    return fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...params.body, pinataContent: obj.content }),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  }
};

export const abbreviateAddress = (address: string) =>
  `${address.slice(0, 8)}...${address.slice(-4)}`;

export const prefixZero = (i: number): string =>
  i < 10 ? "0" + i : i.toString();

export const getDaysLeft = (epochTime: number) => {
  const currentTimestamp = Math.floor(Date.now() / 1000); // current timestamp in seconds
  const secondsPerDay = 60 * 60 * 24; // number of seconds per day

  const differenceInSeconds = epochTime - currentTimestamp;
  const differenceInDays = Math.floor(differenceInSeconds / secondsPerDay);

  return differenceInDays;
};

export const listenForOutsideClicks = ({
  listening,
  setListening,
  menuRef,
  setOpen,
}: {
  listening: boolean;
  setListening: React.Dispatch<React.SetStateAction<boolean>>;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return () => {
    if (listening) return;
    if (!menuRef.current) return;
    setListening(true);
    [`click`, `touchstart`].forEach((type) => {
      document.addEventListener(type, (evt) => {
        if (menuRef.current && menuRef.current.contains(evt.target as Node)) {
          return;
        }
        setOpen(false);
      });
    });
  };
};
