import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { BigNumber, ethers } from "ethers";
import { useMemo, useState } from "react";
import {
  ApplicationMetadata,
  InputType,
  IPFSObject,
  MatchingStatsData,
  Program,
} from "./types";

export enum ChainId {
  MAINNET = 1,
  GOERLI_CHAIN_ID = 5,
  OPTIMISM_MAINNET_CHAIN_ID = 10,
  FANTOM_MAINNET_CHAIN_ID = 250,
  FANTOM_TESTNET_CHAIN_ID = 4002,
}

// NB: number keys are coerced into strings for JS object keys
export const CHAINS: Record<number, Program["chain"]> = {
  [ChainId.MAINNET]: {
    id: ChainId.MAINNET,
    name: "Mainnet", // TODO get canonical network names
    logo: "./logos/ethereum-eth-logo.svg",
  },
  [ChainId.GOERLI_CHAIN_ID]: {
    id: ChainId.GOERLI_CHAIN_ID,
    name: "Goerli", // TODO get canonical network names
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

export type PayoutToken = {
  name: string;
  chainId: number;
  address: string;
  logo?: string;
  default?: boolean; // TODO: this is only used to provide the initial placeholder item, look for better solution
  coingeckoId?: string;
  decimal: number;
};

export type SupportType = {
  name: string;
  regex: string;
  default: boolean;
};

export const TokenNamesAndLogos: Record<string, string> = {
  FTM: "./logos/fantom-logo.svg",
  BUSD: "./logos/busd-logo.svg",
  DAI: "./logos/dai-logo.svg",
  ETH: "./logos/ethereum-eth-logo.svg",
};

export const TokenAndCoinGeckoIds: Record<string, string> = {
  FTM: "fantom",
  BUSD: "binance-usd",
  DAI: "dai",
  ETH: "ethereum",
};

export const payoutTokens: PayoutToken[] = [
  {
    name: "DAI",
    chainId: ChainId.MAINNET,
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    logo: TokenNamesAndLogos["DAI"],
    coingeckoId: TokenAndCoinGeckoIds["DAI"],
    decimal: 18,
  },
  {
    name: "ETH",
    chainId: ChainId.MAINNET,
    address: ethers.constants.AddressZero,
    logo: TokenNamesAndLogos["ETH"],
    coingeckoId: TokenAndCoinGeckoIds["ETH"],
    decimal: 18,
  },
  {
    name: "DAI",
    chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    logo: TokenNamesAndLogos["DAI"],
    coingeckoId: TokenAndCoinGeckoIds["DAI"],
    decimal: 18,
  },
  {
    name: "ETH",
    chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    address: ethers.constants.AddressZero,
    logo: TokenNamesAndLogos["ETH"],
    coingeckoId: TokenAndCoinGeckoIds["ETH"],
    decimal: 18,
  },
  {
    name: "WFTM",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    logo: TokenNamesAndLogos["FTM"],
    coingeckoId: TokenAndCoinGeckoIds["FTM"],
    decimal: 18,
  },
  {
    name: "FTM",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: ethers.constants.AddressZero,
    logo: TokenNamesAndLogos["FTM"],
    coingeckoId: TokenAndCoinGeckoIds["FTM"],
    decimal: 18,
  },
  {
    name: "BUSD",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50",
    logo: TokenNamesAndLogos["BUSD"],
    coingeckoId: TokenAndCoinGeckoIds["BUSD"],
    decimal: 18,
  },
  {
    name: "DAI",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
    logo: TokenNamesAndLogos["DAI"],
    coingeckoId: TokenAndCoinGeckoIds["DAI"],
    decimal: 18,
  },
  {
    name: "DAI",
    chainId: ChainId.FANTOM_TESTNET_CHAIN_ID,
    address: "0xEdE59D58d9B8061Ff7D22E629AB2afa01af496f4",
    logo: TokenNamesAndLogos["DAI"],
    coingeckoId: TokenAndCoinGeckoIds["DAI"],
    decimal: 18,
  },
  {
    name: "BUSD",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: "0xa7c3bf25ffea8605b516cf878b7435fe1768c89b",
    logo: TokenNamesAndLogos["BUSD"],
    coingeckoId: TokenAndCoinGeckoIds["BUSD"],
    decimal: 18,
  },
  {
    name: "DAI",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844",
    logo: TokenNamesAndLogos["DAI"],
    coingeckoId: TokenAndCoinGeckoIds["DAI"],
    decimal: 18,
  },
  {
    name: "LOLG",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: "0x7f329D36FeA6b3AD10E6e36f2728e7e6788a938D",
    logo: TokenNamesAndLogos["DAI"],
    coingeckoId: TokenAndCoinGeckoIds["DAI"],
    decimal: 18,
  },
  {
    name: "ETH",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: ethers.constants.AddressZero,
    logo: TokenNamesAndLogos["ETH"],
    coingeckoId: TokenAndCoinGeckoIds["ETH"],
    decimal: 18,
  },
];
/*TODO: merge this and the above into one list / function*/
export const getPayoutTokenOptions = (chainId: ChainId): PayoutToken[] => {
  switch (chainId) {
    case ChainId.MAINNET: {
      return [
        {
          name: "DAI",
          chainId: ChainId.MAINNET,
          address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          logo: TokenNamesAndLogos["DAI"],
          decimal: 18,
        },
        {
          name: "ETH",
          chainId: ChainId.MAINNET,
          address: ethers.constants.AddressZero,
          logo: TokenNamesAndLogos["ETH"],
          decimal: 18,
        },
      ];
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      return [
        {
          name: "DAI",
          chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
          address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
          logo: TokenNamesAndLogos["DAI"],
          decimal: 18,
        },
        {
          name: "ETH",
          chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
          address: ethers.constants.AddressZero,
          logo: TokenNamesAndLogos["ETH"],
          decimal: 18,
        },
      ];
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      return [
        {
          name: "WFTM",
          chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
          address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
          logo: TokenNamesAndLogos["FTM"],
          decimal: 18,
        },
        {
          name: "FTM",
          chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
          address: ethers.constants.AddressZero,
          logo: TokenNamesAndLogos["FTM"],
          decimal: 18,
        },
        {
          name: "BUSD",
          chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
          address: "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50",
          logo: TokenNamesAndLogos["BUSD"],
          decimal: 18,
        },
        {
          name: "DAI",
          chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
          address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
          logo: TokenNamesAndLogos["DAI"],
          decimal: 18,
        },
      ];
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      return [
        {
          name: "DAI",
          chainId: ChainId.FANTOM_TESTNET_CHAIN_ID,
          address: "0xEdE59D58d9B8061Ff7D22E629AB2afa01af496f4",
          logo: TokenNamesAndLogos["DAI"],
          decimal: 18,
        },
      ];
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      return [
        {
          name: "BUSD",
          chainId: ChainId.GOERLI_CHAIN_ID,
          address: "0xa7c3bf25ffea8605b516cf878b7435fe1768c89b",
          logo: TokenNamesAndLogos["BUSD"],
          decimal: 18,
        },
        {
          name: "DAI",
          chainId: ChainId.GOERLI_CHAIN_ID,
          address: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844",
          logo: TokenNamesAndLogos["DAI"],
          decimal: 18,
        },
        {
          name: "ETH",
          chainId: ChainId.GOERLI_CHAIN_ID,
          address: ethers.constants.AddressZero,
          logo: TokenNamesAndLogos["ETH"],
          decimal: 18,
        },
      ];
    }
  }
};
/**
 * Fetch data from IPFS
 * TODO: include support for fetching abitrary data e.g images
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

export interface SchemaQuestion {
  id: number;
  title: string;
  type: InputType;
  required: boolean;
  hidden: boolean;
  choices?: string[];
  encrypted: boolean;
}

export interface ProjectRequirementsSchema {
  twitter: {
    required: boolean;
    verification: boolean;
  };
  github: {
    required: boolean;
    verification: boolean;
  };
}

export interface ApplicationSchema {
  questions: Array<SchemaQuestion>;
  requirements: ProjectRequirementsSchema;
}

/**
 * This function generates the round application schema to be stored in a decentralized storage
 *
 * @param questions - The metadata of a round application
 * @returns The application schema
 */
export const generateApplicationSchema = (
  questions: ApplicationMetadata["questions"],
  requirements: ApplicationMetadata["requirements"]
): ApplicationSchema => {
  const schema = { questions: new Array<SchemaQuestion>(), requirements };
  if (!questions) return schema;

  schema.questions = questions.map((question, index) => {
    return {
      id: index,
      title: question.title,
      type: question.type,
      required: question.required,
      info: "",
      choices: question.choices,
      hidden: question.hidden,
      encrypted: question.encrypted,
    };
  });

  return schema;
};

/* We can safely suppress the eslint warning here, since JSON.stringify accepts any*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveObjectAsJson(filename: string, dataObjToWrite: any) {
  const blob = new Blob([JSON.stringify(dataObjToWrite)], {
    type: "text/json",
  });
  const link = document.createElement("a");

  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

  const evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  link.dispatchEvent(evt);
  link.remove();
}

export const prefixZero = (i: number): string =>
  i < 10 ? "0" + i : i.toString();

export const getUTCDate = (date: Date): string => {
  const utcDate = [
    prefixZero(date.getUTCDate()),
    prefixZero(date.getUTCMonth() + 1),
    prefixZero(date.getUTCFullYear()),
  ];

  return utcDate.join("/");
};

export const getUTCTime = (date: Date): string => {
  const utcTime = [
    prefixZero(date.getUTCHours()),
    prefixZero(date.getUTCMinutes()),
  ];

  return utcTime.join(":") + " UTC";
};

export function typeToText(s: string) {
  if (s == "address") return "Wallet address";
  if (s == "checkbox") return "Checkboxes";
  return (s.charAt(0).toUpperCase() + s.slice(1)).replace("-", " ");
}

export const useTokenPrice = (tokenId: string | undefined) => {
  const [tokenPrice, setTokenPrice] = useState<number>();
  const [error, setError] = useState<Response | undefined>();
  const [loading, setLoading] = useState(false);

  useMemo(() => {
    setLoading(true);
    const tokenPriceEndpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`;
    fetch(tokenPriceEndpoint, {
      headers: {
        method: "GET",
        Accept: "application/json",
      },
      mode: "no-cors",
    })
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          setError(resp);
          setLoading(false);
        }
      })
      .then((data) => {
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const { usd } = data[tokenId!];
          setTokenPrice(usd);
        } else {
          setError(data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("error fetching token price", { err });
        setError(err);
        setLoading(false);
      });
  }, [tokenId]);

  return {
    data: tokenPrice,
    error,
    loading,
  };
};

/**
 * Fetch link to contract on Etherscan or other explorer
 *
 * @param chainId - The chain ID of the blockchain
 * @param contractAddress - The address of the contract
 * @returns The link to the contract on Etherscan or other
 * explorer for the given chain ID and contract address
 */
export const getTxExplorerForContract = (
  chainId: ChainId,
  contractAddress: string
) => {
  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
      return `https://optimistic.etherscan.io/address/${contractAddress}`;

    case ChainId.FANTOM_MAINNET_CHAIN_ID:
      return `https://ftmscan.com/address/${contractAddress}`;

    case ChainId.FANTOM_TESTNET_CHAIN_ID:
      return `https://testnet.ftmscan.com/address/${contractAddress}`;

    case ChainId.MAINNET:
      return `https://etherscan.io/address/${contractAddress}`;

    default:
      return `https://goerli.etherscan.io/address/${contractAddress}`;
  }
};
/**
 * Generate merkle tree
 *
 * To get merkle Proof: tree.getProof(distributions[0]);
 * @param matchingResults MatchingStatsData[]
 * @returns
 */
export const generateMerkleTree = (
  matchingResults: MatchingStatsData[]
): {
  distribution: [number, string, BigNumber, string][];
  tree: StandardMerkleTree<[number, string, BigNumber, string]>;
  matchingResults: MatchingStatsData[];
} => {
  const distribution: [number, string, BigNumber, string][] = [];

  matchingResults.forEach((matchingResult, index) => {
    matchingResults[index].index = index;

    distribution.push([
      index,
      matchingResult.projectPayoutAddress,
      matchingResult.matchAmountInToken, // TODO: FIX
      matchingResult.projectId,
    ]);
  });

  const tree = StandardMerkleTree.of(distribution, [
    "uint256",
    "address",
    "uint256",
    "bytes32",
  ]);

  return { distribution, tree, matchingResults };
};

export const formatCurrency = (
  value: BigNumber,
  decimal: number,
  fraction?: number
) => {
  return parseFloat(
    ethers.utils.formatUnits(value.toString(), decimal)
  ).toLocaleString("en-US", {
    maximumFractionDigits: fraction || 3,
  });
};
