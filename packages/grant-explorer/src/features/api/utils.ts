/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CartProject, IPFSObject, PayoutToken } from "./types";
import { ChainId, RedstoneTokenIds } from "common";
import { useSearchParams } from "react-router-dom";
import { zeroAddress } from "viem";
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
  { id: ChainId; name: string; logo: string }
> = {
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
} as const;

export const MAINNET_TOKENS: PayoutToken[] = [
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

export const OPTIMISM_MAINNET_TOKENS: PayoutToken[] = [
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

const FANTOM_MAINNET_TOKENS: PayoutToken[] = [
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

const GOERLI_TESTNET_TOKENS: PayoutToken[] = [
  {
    name: "USDC",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    decimal: 6,
    logo: TokenNamesAndLogos["USDC"],
    redstoneTokenId: RedstoneTokenIds["USDC"],
    permitVersion: "2",
    defaultForVoting: false,
    canVote: true,
  },
  {
    name: "DAI",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
    defaultForVoting: false,
    canVote: true,
  },
  {
    name: "ETH",
    chainId: ChainId.GOERLI_CHAIN_ID,
    address: zeroAddress,
    decimal: 18,
    logo: TokenNamesAndLogos["ETH"],
    redstoneTokenId: RedstoneTokenIds["ETH"],
    defaultForVoting: true,
    canVote: true,
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
    defaultForVoting: true,
    canVote: true,
  },
];

const PGN_TESTNET_TOKENS: PayoutToken[] = [
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

const PGN_MAINNET_TOKENS: PayoutToken[] = [
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
];

const ARBITRUM_TOKENS: PayoutToken[] = [
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
    name: "DAI",
    chainId: ChainId.ARBITRUM,
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimal: 18,
    logo: TokenNamesAndLogos["DAI"],
    redstoneTokenId: RedstoneTokenIds["DAI"],
    defaultForVoting: false,
    canVote: true,
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

const ARBITRUM_GOERLI_TOKENS: PayoutToken[] = [
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
];

export const payoutTokens = [
  ...MAINNET_TOKENS,
  ...OPTIMISM_MAINNET_TOKENS,
  ...FANTOM_MAINNET_TOKENS,
  ...GOERLI_TESTNET_TOKENS,
  ...FANTOM_TESTNET_TOKENS,
  ...PGN_TESTNET_TOKENS,
  ...PGN_MAINNET_TOKENS,
  ...ARBITRUM_TOKENS,
  ...ARBITRUM_GOERLI_TOKENS,
];

type PayoutTokensMap = Record<ChainId, PayoutToken[]>;
export const payoutTokensMap: PayoutTokensMap = {
  [ChainId.GOERLI_CHAIN_ID]: GOERLI_TESTNET_TOKENS,
  [ChainId.MAINNET]: MAINNET_TOKENS,
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]: OPTIMISM_MAINNET_TOKENS,
  [ChainId.FANTOM_MAINNET_CHAIN_ID]: FANTOM_MAINNET_TOKENS,
  [ChainId.FANTOM_TESTNET_CHAIN_ID]: FANTOM_TESTNET_TOKENS,
  [ChainId.PGN]: PGN_MAINNET_TOKENS,
  [ChainId.PGN_TESTNET]: PGN_TESTNET_TOKENS,
  [ChainId.ARBITRUM_GOERLI]: ARBITRUM_GOERLI_TOKENS,
  [ChainId.ARBITRUM]: ARBITRUM_TOKENS,
};

export const getPayoutTokenOptions = (chainId: ChainId): PayoutToken[] =>
  payoutTokensMap[chainId];

const graphQlEndpoints: Record<ChainId, string> = {
  [ChainId.PGN]: process.env.REACT_APP_SUBGRAPH_PGN_API!,
  [ChainId.GOERLI_CHAIN_ID]: process.env.REACT_APP_SUBGRAPH_GOERLI_API!,
  [ChainId.PGN_TESTNET]: process.env.REACT_APP_SUBGRAPH_PGN_TESTNET_API!,
  [ChainId.MAINNET]: process.env.REACT_APP_SUBGRAPH_MAINNET_API!,
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API!,
  [ChainId.FANTOM_MAINNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_FANTOM_MAINNET_API!,
  [ChainId.FANTOM_TESTNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_FANTOM_TESTNET_API!,
  [ChainId.ARBITRUM_GOERLI]:
    process.env.REACT_APP_SUBGRAPH_ARBITRUM_GOERLI_API!,
  [ChainId.ARBITRUM]: process.env.REACT_APP_SUBGRAPH_ARBITRUM_API!,
};

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
  [ChainId.MAINNET]: "https://etherscan.io/tx/",
  [ChainId.GOERLI_CHAIN_ID]: "https://goerli.etherscan.io/tx/",
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]: "https://optimistic.etherscan.io/tx/",
  [ChainId.FANTOM_MAINNET_CHAIN_ID]: "https://ftmscan.com/tx/",
  [ChainId.FANTOM_TESTNET_CHAIN_ID]: "ttps://testnet.ftmscan.com/tx/",
  [ChainId.PGN_TESTNET]: "https://explorer.sepolia.publicgoods.network/tx/",
  [ChainId.PGN]: "https://explorer.publicgoods.network/tx/",
  [ChainId.ARBITRUM_GOERLI]: "https://goerli.arbiscan.io/tx/",
  [ChainId.ARBITRUM]: "https://arbiscan.io/tx/",
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
export const graphql_fetch = async (
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

export const getDaysLeft = (epochTime: number) => {
  const currentTimestamp = Math.floor(Date.now() / 1000); // current timestamp in seconds
  const secondsPerDay = 60 * 60 * 24; // number of seconds per day

  const differenceInSeconds = epochTime - currentTimestamp;
  const differenceInDays = Math.floor(differenceInSeconds / secondsPerDay);

  return differenceInDays;
};

export function getChainIds(): number[] {
  const isProduction = process.env.REACT_APP_ENV === "production";
  if (isProduction) {
    return [
      Number(ChainId.MAINNET),
      Number(ChainId.OPTIMISM_MAINNET_CHAIN_ID),
      Number(ChainId.FANTOM_MAINNET_CHAIN_ID),
      Number(ChainId.PGN),
      Number(ChainId.ARBITRUM),
    ];
  } else {
    return Object.values(ChainId)
      .map((chainId) => Number(chainId))
      .filter((id) => !isNaN(id));
  }
}

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
