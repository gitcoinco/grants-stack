import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { BigNumber, ethers } from "ethers";
import {
  ApplicationMetadata,
  InputType,
  IPFSObject,
  MatchingStatsData,
  Program,
  RevisedMatch,
} from "./types";
import { ChainId } from "common";
import { useEffect, useState } from "react";
import Papa from "papaparse";

// NB: number keys are coerced into strings for JS object keys
export const CHAINS: Record<ChainId, Program["chain"]> = {
  [ChainId.DEV1]: {
    id: ChainId.DEV1,
    name: "DEV1",
    logo: "/logos/ethereum-eth-logo.svg",
  },
  [ChainId.DEV2]: {
    id: ChainId.DEV2,
    name: "DEV2",
    logo: "/logos/ethereum-eth-logo.svg",
  },
  [ChainId.MAINNET]: {
    id: ChainId.MAINNET,
    name: "Mainnet", // TODO get canonical network names
    logo: "/logos/ethereum-eth-logo.svg",
  },
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]: {
    id: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    name: "Optimism",
    logo: "/logos/optimism-logo.svg",
  },
  [ChainId.FANTOM_MAINNET_CHAIN_ID]: {
    id: ChainId.FANTOM_MAINNET_CHAIN_ID,
    name: "Fantom",
    logo: "/logos/fantom-logo.svg",
  },
  [ChainId.FANTOM_TESTNET_CHAIN_ID]: {
    id: ChainId.FANTOM_TESTNET_CHAIN_ID,
    name: "Fantom Testnet",
    logo: "/logos/fantom-logo.svg",
  },
  [ChainId.PGN_TESTNET]: {
    id: ChainId.PGN_TESTNET,
    name: "PGN Testnet",
    logo: "/logos/pgn-logo.svg",
  },
  [ChainId.PGN]: {
    id: ChainId.PGN_TESTNET,
    name: "PGN",
    logo: "/logos/pgn-logo.svg",
  },
  [ChainId.ARBITRUM]: {
    id: ChainId.ARBITRUM,
    name: "Arbitrum",
    logo: "/logos/arb-logo.svg",
  },
  [ChainId.ARBITRUM_GOERLI]: {
    id: ChainId.ARBITRUM_GOERLI,
    name: "Arbitrum Goerli",
    logo: "/logos/arb-logo.svg",
  },
  [ChainId.AVALANCHE]: {
    id: ChainId.AVALANCHE,
    name: "Avalanche",
    logo: "/logos/avax-logo.svg",
  },
  [ChainId.FUJI]: {
    id: ChainId.FUJI,
    name: "Fuji (Avalanche Testnet)",
    logo: "/logos/avax-logo.svg",
  },
  [ChainId.POLYGON]: {
    id: ChainId.POLYGON,
    name: "Polygon PoS",
    logo: "./logos/pol-logo.svg",
  },
  [ChainId.POLYGON_MUMBAI]: {
    id: ChainId.POLYGON_MUMBAI,
    name: "Polygon Mumbai",
    logo: "./logos/pol-logo.svg",
  },
  [ChainId.BASE]: {
    id: ChainId.BASE,
    name: "Base",
    logo: "/logos/base-logo.svg",
  },
  [ChainId.ZKSYNC_ERA_MAINNET_CHAIN_ID]: {
    id: ChainId.ZKSYNC_ERA_MAINNET_CHAIN_ID,
    name: "zkSync Era",
    logo: "/logos/zksync-logo.svg",
  },
  [ChainId.ZKSYNC_ERA_TESTNET_CHAIN_ID]: {
    id: ChainId.ZKSYNC_ERA_TESTNET_CHAIN_ID,
    name: "zkSync Era Testnet",
    logo: "/logos/zksync-logo.svg",
  },
  [ChainId.SEPOLIA]: {
    id: ChainId.SEPOLIA,
    name: "Sepolia",
    logo: "/logos/ethereum-eth-logo.svg",
  },
  [ChainId.SCROLL]: {
    id: ChainId.SCROLL,
    name: "Scroll",
    logo: "/logos/scroll-logo.svg",
  },
  [ChainId.SEI_DEVNET]: {
    id: ChainId.SEI_DEVNET,
    name: "SEI Devnet",
    logo: "/logos/sei.png",
  },
  [ChainId.LUKSO]: {
    id: ChainId.LUKSO,
    name: "Lukso",
    logo: "/logos/lukso-logo.svg",
  },
  [ChainId.LUKSO_TESTNET]: {
    id: ChainId.LUKSO_TESTNET,
    name: "Lukso Testnet",
    logo: "/logos/lukso-logo.svg",
  },
  [ChainId.CELO]: {
    id: ChainId.CELO,
    name: "Celo",
    logo: "/logos/celo-logo.svg",
  },
  [ChainId.CELO_ALFAJORES]: {
    id: ChainId.CELO_ALFAJORES,
    name: "Celo Alfajores",
    logo: "/logos/celo-logo.svg",
  },
};

export type SupportType = {
  name: string;
  regex: string;
  default: boolean;
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
export const pinToIPFS = (obj: IPFSObject): Promise<{ IpfsHash: string }> => {
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
  fixed?: boolean;
  metadataExcluded?: boolean;
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
 * @param requirements
 * @returns The application schema
 */
export const generateApplicationSchema = (
  questions: ApplicationMetadata["questions"],
  requirements: ApplicationMetadata["requirements"]
): ApplicationSchema => {
  const schema = { questions: new Array<SchemaQuestion>(), requirements };
  if (!questions) return schema;

  schema.questions = questions
    .filter((q) => !q.metadataExcluded)
    .map((question, index) => {
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

export function typeToText(s: string) {
  if (s == "address") return "Wallet address";
  if (s == "checkbox") return "Checkboxes";
  return (s.charAt(0).toUpperCase() + s.slice(1)).replace("-", " ");
}

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

    case ChainId.ARBITRUM:
      return `https://arbiscan.io/address/${contractAddress}`;
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

export const useMatchCSVParser = (file: File | null) => {
  const [data, setData] = useState<RevisedMatch[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setData(undefined);
      setError(undefined);
      return;
    }

    const parseCSV = (file: File) => {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const matches: RevisedMatch[] = results.data.map((row: any) => ({
              revisedContributionCount: parseInt(row["contributionsCount"]),
              revisedMatch: BigInt(row["matched"]),
              matched: BigInt(row["matched"]),
              contributionsCount: parseInt(row["contributionsCount"]),
              projectId: row["projectId"],
              applicationId: row["applicationId"],
              projectName: row["projectName"],
              payoutAddress: row["payoutAddress"],
            }));
            setData(matches);
            setLoading(false);
          },
          error: (error: Error) => {
            setError(error);
            setLoading(false);
          },
        });
      };
      reader.onerror = (error: Event) => {
        setError(error as unknown as Error);
        setLoading(false);
      };
      reader.readAsText(file);
    };

    parseCSV(file);
  }, [file]);

  return { data, loading, error };
};
