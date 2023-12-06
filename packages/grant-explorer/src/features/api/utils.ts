/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CartProject, IPFSObject, VotingToken, Round } from "./types";
import {
  ChainId,
  graphQlEndpoints,
  RedstoneTokenIds,
  RoundPayoutType,
} from "common";
import { useSearchParams } from "react-router-dom";
import { ROUND_PAYOUT_MERKLE, ROUND_PAYOUT_DIRECT } from "common";
import { getAddress, zeroAddress } from "viem";
import { ethers } from "ethers";

export function useDebugMode(): boolean {
  const [searchParams] = useSearchParams();

  return (
    (process.env.REACT_APP_ALLOW_URL_DEBUG_MODE === "true" &&
      searchParams.get("debug") === "true") ||
    process.env.REACT_APP_DEBUG_MODE === "true"
  );
}

export const CHAINS: Record<
  ChainId,
  {
    id: ChainId;
    name: string;
    logo: string;
  }
> = {
  [ChainId.DEV1]: {
    id: ChainId.DEV1,
    name: "DEV1",
    logo: "./logos/pgn-logo.svg",
  },
  [ChainId.DEV2]: {
    id: ChainId.DEV2,
    name: "DEV2",
    logo: "./logos/pgn-logo.svg",
  },
  [ChainId.PGN]: {
    id: ChainId.PGN,
    name: "PGN",
    logo: "./logos/pgn-logo.svg",
  },
  [ChainId.MAINNET]: {
    id: ChainId.MAINNET,
    name: "Mainnet",
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
  [ChainId.PGN_TESTNET]: {
    id: ChainId.PGN_TESTNET,
    name: "PGN Testnet",
    logo: "./logos/pgn-logo.svg",
  },
  [ChainId.ARBITRUM_GOERLI]: {
    id: ChainId.ARBITRUM_GOERLI,
    name: "Arbitrum Goerli",
    logo: "./logos/arb-logo.svg",
  },
  [ChainId.ARBITRUM]: {
    id: ChainId.ARBITRUM,
    name: "Arbitrum",
    logo: "./logos/arb-logo.svg",
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
};

export const TokenNamesAndLogos = {
  FTM: "./logos/fantom-logo.svg",
  BUSD: "./logos/busd-logo.svg",
  USDC: "./logos/usdc-logo.svg",
  DAI: "./logos/dai-logo.svg",
  ETH: "./logos/ethereum-eth-logo.svg",
  OP: "./logos/optimism-logo.svg",
  PGN: "./logos/pgn-logo.svg",
  GcV: "./logos/fantom-gcv-logo.png",
  ARB: "./logos/arb-logo.svg",
  AVAX: "./logos/avax-logo.svg",
  MATIC: "./logos/pol-logo.svg",
} as const;

export const MAINNET_TOKENS: VotingToken[] = [
  {
    name: "DAI",
    chainId: ChainId.MAINNET,
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
    defaultForVoting: false,
    canVote: true,
  },
  {
    name: "ETH",
    chainId: ChainId.MAINNET,
    address: zeroAddress,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
    defaultForVoting: true,
    canVote: true,
  },
];

export const OPTIMISM_MAINNET_TOKENS: VotingToken[] = [
  {
    name: "DAI",
    chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
    permitVersion: "2",
    defaultForVoting: false,
    canVote: true,
  },
  {
    name: "ETH",
    chainId: ChainId.OPTIMISM_MAINNET_CHAIN_ID,
    address: zeroAddress,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
    defaultForVoting: true,
    canVote: true,
  },
];

const FANTOM_MAINNET_TOKENS: VotingToken[] = [
  {
    name: "WFTM",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    decimal: 18,
    logo: TokenNamesAndLogos["FTM"],
    redstoneTokenId: RedstoneTokenIds["FTM"],
    defaultForVoting: false,
    canVote: false,
  },
  {
    name: "FTM",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: zeroAddress,
    decimal: 18,
    logo: TokenNamesAndLogos["FTM"],
    redstoneTokenId: RedstoneTokenIds["FTM"],
    defaultForVoting: false,
    canVote: false,
  },
  {
    name: "BUSD",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50",
    decimal: 18,
    logo: TokenNamesAndLogos["BUSD"],
    redstoneTokenId: RedstoneTokenIds["BUSD"],
    defaultForVoting: false,
    canVote: false,
  },
  {
    name: "DAI",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
    defaultForVoting: false,
    canVote: false,
  },
  {
    name: "GcV",
    chainId: ChainId.FANTOM_MAINNET_CHAIN_ID,
    address: "0x83791638da5EB2fAa432aff1c65fbA47c5D29510",
    decimal: 18,
    logo: TokenNamesAndLogos["GcV"],
    redstoneTokenId: RedstoneTokenIds["DAI"], // We use DAI to keep the valueless token to 1$
    defaultForVoting: true,
    canVote: true,
  },
];

const FANTOM_TESTNET_TOKENS: VotingToken[] = [
  {
    name: "DAI",
    chainId: ChainId.FANTOM_TESTNET_CHAIN_ID,
    address: "0xEdE59D58d9B8061Ff7D22E629AB2afa01af496f4",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
    defaultForVoting: true,
    canVote: true,
  },
];

const PGN_TESTNET_TOKENS: VotingToken[] = [
  {
    name: "TEST",
    chainId: ChainId.PGN_TESTNET,
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
    defaultForVoting: false,
    canVote: true,
  },
  {
    name: "ETH",
    chainId: ChainId.PGN_TESTNET,
    address: zeroAddress,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
    defaultForVoting: true,
    canVote: true,
  },
];

const PGN_MAINNET_TOKENS: VotingToken[] = [
  {
    name: "ETH",
    chainId: ChainId.PGN,
    address: zeroAddress,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
    defaultForVoting: true,
    canVote: true,
  },
  {
    name: "DAI",
    chainId: ChainId.PGN,
    address: "0x6C121674ba6736644A7e73A8741407fE8a5eE5BA",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
    defaultForVoting: false,
    canVote: true,
  },
];

const ARBITRUM_TOKENS: VotingToken[] = [
  {
    name: "ETH",
    chainId: ChainId.ARBITRUM,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
    defaultForVoting: false,
    canVote: true,
  },
  {
    name: "USDC",
    chainId: ChainId.ARBITRUM,
    address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
    defaultForVoting: false,
    canVote: true,
    permitVersion: "2",
  },
  {
    name: "ARB",
    chainId: ChainId.ARBITRUM,
    address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    decimal: 18,
    logo: TokenNamesAndLogos["ARB"],
    redstoneTokenId: RedstoneTokenIds["ARB"],
    defaultForVoting: true,
    canVote: true,
  },
];

const ARBITRUM_GOERLI_TOKENS: VotingToken[] = [
  {
    name: "ETH",
    chainId: ChainId.ARBITRUM_GOERLI,
    address: zeroAddress,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
    defaultForVoting: true,
    canVote: true,
  },
];

const POLYGON_TOKENS: VotingToken[] = [
  {
    name: "MATIC",
    chainId: ChainId.POLYGON,
    address: zeroAddress,
    decimal: 18,
    logo: TokenNamesAndLogos["MATIC"],
    redstoneTokenId: RedstoneTokenIds["MATIC"],
    defaultForVoting: true,
    canVote: true,
  },
  {
    name: "USDC",
    chainId: ChainId.POLYGON,
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
    defaultForVoting: false,
    canVote: true,
    permitVersion: "2",
  },
];

const POLYGON_MUMBAI_TOKENS: VotingToken[] = [
  {
    name: "MATIC",
    chainId: ChainId.POLYGON_MUMBAI,
    address: zeroAddress,
    decimal: 18,
    logo: TokenNamesAndLogos["MATIC"],
    redstoneTokenId: RedstoneTokenIds["MATIC"],
    defaultForVoting: true,
    canVote: true,
  },
  {
    name: "USDC",
    chainId: ChainId.POLYGON_MUMBAI,
    address: "0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
    defaultForVoting: false,
    canVote: true,
    permitVersion: "2",
  },
];

const AVALANCHE_TOKENS: VotingToken[] = [
  {
    name: "AVAX",
    chainId: ChainId.AVALANCHE,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["AVAX"],
    redstoneTokenId: RedstoneTokenIds["AVAX"],
    defaultForVoting: true,
    canVote: true,
  },
  {
    name: "USDC",
    chainId: ChainId.AVALANCHE,
    address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
    defaultForVoting: false,
    canVote: true,
    permitVersion: "2",
  },
];

const FUJI_TOKENS: VotingToken[] = [
  {
    name: "AVAX",
    chainId: ChainId.AVALANCHE,
    address: ethers.constants.AddressZero,
    decimal: 18,
    logo: TokenNamesAndLogos["AVAX"],
    redstoneTokenId: RedstoneTokenIds["AVAX"],
    defaultForVoting: true,
    canVote: true,
  },
  {
    name: "USDC",
    chainId: ChainId.AVALANCHE,
    address: "0x5425890298aed601595a70ab815c96711a31bc65",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
    defaultForVoting: false,
    canVote: true,
    permitVersion: "2",
  },
];

export const votingTokens = [
  ...MAINNET_TOKENS,
  ...OPTIMISM_MAINNET_TOKENS,
  ...FANTOM_MAINNET_TOKENS,
  ...FANTOM_TESTNET_TOKENS,
  ...PGN_TESTNET_TOKENS,
  ...PGN_MAINNET_TOKENS,
  ...ARBITRUM_TOKENS,
  ...ARBITRUM_GOERLI_TOKENS,
  ...AVALANCHE_TOKENS,
  ...FUJI_TOKENS,
  ...POLYGON_TOKENS,
  ...POLYGON_MUMBAI_TOKENS,
];

type VotingTokensMap = Record<ChainId, VotingToken[]>;
export const votingTokensMap: VotingTokensMap = {
  // FIXME: deploy tokens for local dev chains when we
  // setup explorer to work fully in local
  [ChainId.DEV1]: MAINNET_TOKENS,
  [ChainId.DEV2]: MAINNET_TOKENS,
  [ChainId.MAINNET]: MAINNET_TOKENS,
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]: OPTIMISM_MAINNET_TOKENS,
  [ChainId.FANTOM_MAINNET_CHAIN_ID]: FANTOM_MAINNET_TOKENS,
  [ChainId.FANTOM_TESTNET_CHAIN_ID]: FANTOM_TESTNET_TOKENS,
  [ChainId.PGN]: PGN_MAINNET_TOKENS,
  [ChainId.PGN_TESTNET]: PGN_TESTNET_TOKENS,
  [ChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_TOKENS,
  [ChainId.ARBITRUM]: ARBITRUM_TOKENS,
  [ChainId.AVALANCHE]: AVALANCHE_TOKENS,
  [ChainId.FUJI]: FUJI_TOKENS,
  [ChainId.POLYGON]: POLYGON_TOKENS,
  [ChainId.POLYGON_MUMBAI]: POLYGON_MUMBAI_TOKENS,
};

export const getVotingTokenOptions = (chainId: ChainId): VotingToken[] =>
  votingTokensMap[chainId];

/**
 * Fetch subgraph network for provided web3 network
 * The backticks are here to work around a failure of a test that tetsts graphql_fetch,
 * and fails if the endpoint is undefined, so we convert the undefined to a string here in order not to fail the test.
 *
 * @param chainId - The chain ID of the blockchain
 * @returns the subgraph endpoint
 */
const getGraphQLEndpoint = (chainId: ChainId) => `${graphQlEndpoints[chainId]}`;

export const txExplorerLinks: Record<ChainId, string> = {
  [ChainId.DEV1]: "",
  [ChainId.DEV2]: "",
  [ChainId.MAINNET]: "https://etherscan.io/tx/",
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]: "https://optimistic.etherscan.io/tx/",
  [ChainId.FANTOM_MAINNET_CHAIN_ID]: "https://ftmscan.com/tx/",
  [ChainId.FANTOM_TESTNET_CHAIN_ID]: "ttps://testnet.ftmscan.com/tx/",
  [ChainId.PGN_TESTNET]: "https://explorer.sepolia.publicgoods.network/tx/",
  [ChainId.PGN]: "https://explorer.publicgoods.network/tx/",
  [ChainId.ARBITRUM_GOERLI]: "https://goerli.arbiscan.io/tx/",
  [ChainId.ARBITRUM]: "https://arbiscan.io/tx/",
  [ChainId.POLYGON]: "https://polygonscan.com/tx/",
  [ChainId.POLYGON_MUMBAI]: "https://mumbai.polygonscan.com/tx/",
  [ChainId.FUJI]: "https://snowtrace.io/tx/",
  [ChainId.AVALANCHE]: "https://testnet.snowtrace.io/txt/",
};

/**
 * Fetch the correct transaction explorer for the provided web3 network
 *
 * @param chainId - The chain ID of the blockchain
 * @param txHash - The transaction hash
 * @returns the transaction explorer URL for the provided transaction hash and network
 */
export const getTxExplorerTxLink = (chainId: ChainId, txHash: string) => {
  return txExplorerLinks[chainId] + txHash;
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
export const __deprecated_graphql_fetch = async (
  query: string,
  chainId: ChainId,
  // eslint-disable-next-line @typescript-eslint/ban-types
  variables: object = {},
  fromProjectRegistry = false
) => {
  let endpoint = getGraphQLEndpoint(chainId);

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
export const __deprecated_fetchFromIPFS = (cid: string) => {
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

export const getDaysLeft = (fromTimestamp?: string) => {
  // Some timestamps are returned as overflowed (1.15e+77)
  // We parse these into undefined to show as "No end date" rather than make the date diff calculation
  if (
    fromTimestamp === undefined ||
    Number(fromTimestamp) > Number.MAX_SAFE_INTEGER
  ) {
    return undefined;
  }
  const currentTimestamp = Math.floor(Date.now() / 1000); // current timestamp in seconds
  const secondsPerDay = 60 * 60 * 24; // number of seconds per day

  const differenceInSeconds = Number(fromTimestamp) - currentTimestamp;
  const differenceInDays = Math.floor(differenceInSeconds / secondsPerDay);

  return differenceInDays;
};

/* TODO: remove this and get the production chains automatically */
export function getChainIds(): number[] {
  const isProduction = process.env.REACT_APP_ENV === "production";
  if (isProduction) {
    return [
      Number(ChainId.MAINNET),
      Number(ChainId.OPTIMISM_MAINNET_CHAIN_ID),
      Number(ChainId.FANTOM_MAINNET_CHAIN_ID),
      Number(ChainId.PGN),
      Number(ChainId.ARBITRUM),
      Number(ChainId.AVALANCHE),
      Number(ChainId.POLYGON),
    ];
  } else {
    return Object.values(ChainId)
      .map((chainId) => Number(chainId))
      .filter((id) => !isNaN(id));
  }
}

export const isDirectRound = (round: Round) =>
  round.payoutStrategy.strategyName === ROUND_PAYOUT_DIRECT;
export const isInfiniteDate = (roundTime: Date) =>
  roundTime.toString() === "Invalid Date";

export const getRoundType = (payoutStrategyName: RoundPayoutType) => {
  switch (payoutStrategyName) {
    case ROUND_PAYOUT_MERKLE:
      return "Quadratic Funding";
      break;
    case ROUND_PAYOUT_DIRECT:
      return "Direct Grants";
      break;
    default:
      return payoutStrategyName;
      break;
  }
};

type GroupedCartProjects = {
  [chainId: number]: {
    [roundId: string]: CartProject[];
  };
};

export type GroupedCartProjectsByRoundId = {
  [roundId: string]: CartProject[];
};

export const groupProjectsInCart = (
  cartProjects: CartProject[]
): GroupedCartProjects => {
  // Initialize an empty object to store the grouped cart projects
  const groupedCartProjects: GroupedCartProjects = {};

  // Iterate over each cart project and group them by chainId and roundId
  cartProjects.forEach((cartProject) => {
    const { chainId, roundId } = cartProject;

    // If the chainId doesn't exist in the groupedCartProjects object, create it
    if (!groupedCartProjects[chainId]) {
      groupedCartProjects[chainId] = {};
    }

    // If the roundId doesn't exist in the chainId group, create it
    if (!groupedCartProjects[chainId][roundId]) {
      groupedCartProjects[chainId][roundId] = [];
    }

    // Add the cartProject to the corresponding roundId group
    groupedCartProjects[chainId][roundId].push(cartProject);
  });

  return groupedCartProjects;
};

export function getPayoutToken(
  token: string,
  chainId: ChainId
): VotingToken | undefined {
  if (!ChainId[Number(chainId)]) {
    throw new Error(`Couldn't find chainId: ${chainId}`);
  }
  return votingTokens.find(
    (t) => t.chainId === Number(chainId) && t.address === getAddress(token)
  );
}

export function dateFromMs(ms: number) {
  if (!ms) return "Invalid date";
  const normalized = String(ms).length < 13 ? ms * 1000 : ms;
  const date = new Date(normalized);

  return Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}
