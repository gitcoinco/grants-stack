import { VotingStrategy } from "@prisma/client";
import { getAddress } from "ethers/lib/utils";
import { Response } from "express";
import fetch from "node-fetch";
import {
  ChainId,
  ChainName,
  RoundMetadata,
  DenominationResponse,
  MetaPtr,
} from "./types";
import { cache } from "./cacheConfig";

const TESNET_TOKEN_TO_USD_RATE = 1000;

type TokenPriceMapping = {
  [address: string]: {
    usd: number
  };
}

type AvgTokenPriceMapping = {
  [address: string]: number;
}

type TokenStartEndPrice = {
  startPrice: number;
  endPrice: number;
}

/**
 * Fetch subgraph network for provided web3 network
 *
 * @param chainId - The chain ID of the blockchain
 * @returns the subgraph endpoint
 */
export const getGraphQLEndpoint = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET:
      return `${process.env.SUBGRAPH_OPTIMISM_MAINNET_API}`;

    case ChainId.FANTOM_MAINNET:
      return `${process.env.SUBGRAPH_FANTOM_MAINNET_API}`;

    case ChainId.FANTOM_TESTNET:
      return `${process.env.SUBGRAPH_FANTOM_TESTNET_API}`;

    case ChainId.MAINNET:
      return `${process.env.SUBGRAPH_MAINNET_API}`;

    case ChainId.GOERLI:
      return `${process.env.SUBGRAPH_GOERLI_API}`;

    default:
      return `${process.env.SUBGRAPH_DUMMY_API}`;
  }
};

/**
 * Returns USDC address based on chain Id.
 * Useful when you need to convert amount from a given token
 * to USDC (stable coin)
 *
 * @param chainId ChainId
 * @returns string
 */
export const getUSDCAddress = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET:
      return "0x7f5c764cbc14f9669b88837ca1490cca17c31607";

    case ChainId.FANTOM_MAINNET:
      return "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";

    case ChainId.MAINNET:
      return "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

    default:
      return "0x0000000000000000000000000000000000000000";
  }
};

/**
 * Returns the chain name given the id
 *
 * @param id string
 * @returns string
 */
export const getChainVerbose = (id: string) => {
  switch (id) {
    case ChainId.MAINNET:
      return "MAINNET";

    case ChainId.OPTIMISM_MAINNET:
      return "OPTIMISM_MAINNET";

    case ChainId.FANTOM_MAINNET:
      return "FANTOM_MAINNET";

    case ChainId.FANTOM_TESTNET:
      return "FANTOM_TESTNET";

    case ChainId.GOERLI:
      return "GOERLI";

    default:
      return "LOCAL_ROUND_LAB";
  }
};

/**
 * Fetch data from IPFS
 *
 * @param cid - the unique content identifier that points to the data
 */
export const fetchFromIPFS = async (cid: string) => {
  const REACT_APP_PINATA_GATEWAY = "gitcoin.mypinata.cloud";

  return fetch(`https://${REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`).then(
    (resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    }
  );
};

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param query - The query to be executed
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param variables - The variables to be used in the query
 * @returns The result of the query
 */
export const fetchFromGraphQL = async (
  chainId: ChainId,
  query: string,
  variables: object = {}
) => {
  let endpoint = getGraphQLEndpoint(chainId);

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
 * Fetch metadata using roundId
 *
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param roundId - The address of the round contract
 *
 * @returns Promise<RoundMetadata>
 */
export const fetchRoundMetadata = async (
  chainId: ChainId,
  roundId: string,
  force?: boolean
): Promise<RoundMetadata> => {
  // try to get the data from cache
  const key = `cache_metadata_${chainId}_${roundId}`;
  const cachedMetadata: any = cache.get(key);
  if (cachedMetadata && !force) {
    return cachedMetadata;
  }

  const variables = { roundId };

  const query = `
    query GetMetadata($roundId: String) {
      rounds(where: {
        id: $roundId
      }) {
        votingStrategy {
          id
          strategyName
        }
        roundStartTime
        roundEndTime
        token
        roundMetaPtr {
          protocol
          pointer
        }
        projectsMetaPtr {
          protocol
          pointer
        }
      }
    }
  `;

  // fetch from graphql
  const response = await fetchFromGraphQL(chainId, query, variables);
  const data = response.data?.rounds[0];

  // fetch round metadata
  const roundMetadata = await fetchFromIPFS(data?.roundMetaPtr.pointer);
  const totalPot = roundMetadata.matchingFunds.matchingFundsAvailable;
  const matchingCapPercentage = roundMetadata.matchingFunds.matchingCapAmount;
  const strategyName = getStrategyName(data?.votingStrategy.strategyName);

  const projectsMetaPtr: MetaPtr = data?.projectsMetaPtr;

  const metadata: RoundMetadata = {
    votingStrategy: {
      id: data?.votingStrategy.id,
      strategyName: strategyName,
    },
    projectsMetaPtr: projectsMetaPtr,
    roundStartTime: data?.roundStartTime,
    roundEndTime: data?.roundEndTime,
    token: data?.token,
    totalPot: totalPot,
    matchingCapPercentage: matchingCapPercentage,
  };

  // cache the round metadata
  cache.set(key, metadata);

  return metadata;
};

/**
 * Generic function which handles how response is sent
 * for an API implemented in this service
 *
 * @param res Response
 * @param code number
 * @param message string
 * @param body? string|object
 * @returns res.json
 */
export const handleResponse = (
  res: Response,
  code: number,
  message: string,
  body?: string | object | any
) => {
  let success: boolean = false;

  if (code >= 200 && code < 400) {
    success = true;
  }

  return res.json({
    success,
    message,
    data: body ?? {},
  });
};

/**
 * Util function to get chainName for coingecko API calls
 *
 * @param chainId
 * @returns { string, boolean}
 */
export const getChainName = (chainId: ChainId) => {
  let error = true;
  let chainName;

  const coingeckoSupportedChainNames: Record<number, string> = {
    [ChainId.MAINNET]: "ethereum",
    [ChainId.OPTIMISM_MAINNET]: "optimistic-ethereum",
    [ChainId.FANTOM_MAINNET]: "fantom",
  };

  if (coingeckoSupportedChainNames[chainId]) {
    chainName = coingeckoSupportedChainNames[chainId];
    error = false;
  }
  return { chainName, error };
};

export async function getStartAndEndTokenPrices(
  contract: string,
  chainId: ChainId,
  startTime: number,
  endTime: number
): Promise<TokenStartEndPrice> {
  try {

    // Avoid coingecko calling for testnet
    if(isTestnet(chainId)) {
      return {
        startPrice: TESNET_TOKEN_TO_USD_RATE,
        endPrice: TESNET_TOKEN_TO_USD_RATE
      }
    };

    const { chainName, error } = getChainName(chainId);
    if (error) {
      throw new Error(
        `ChainId ${chainId} is not supported by CoinGecko's API.`
      );
    }
    let validAddress = getValidTokenAddress(chainId, contract);
    const url = `https://api.coingecko.com/api/v3/coins/${chainName}/contract/${validAddress}/market_chart/range?vs_currency=usd&from=${startTime}&to=${endTime}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    // TODO: Log to sentry
    const data = await res.json();

    if (data.error || data.status) {
      throw new Error("An error occurred");
    }

    // NOTE: If the start or end time is out of range, the API will return the closest price to the start or end time
    //       by selecting the first and last element in the array
    //       We should consider storing this information in the future.
    const startPrice = data.prices[0][1];
    const endPrice = data.prices[data.prices.length - 1][1];
    return { startPrice, endPrice };
  } catch (error) {
    console.error(
      `getStartAndEndTokenPrices : contract: ${contract}, chainId: ${chainId}`,
      error
    );
    throw error;
  }
}

export async function denominateAs(
  token: string,
  asToken: string,
  amount: number,
  startTime: number,
  endTime: number,
  chainId: ChainId
): Promise<DenominationResponse> {
  try {
    const tokenPrices = await getStartAndEndTokenPrices(
      token,
      chainId,
      startTime,
      endTime
    );
    const asTokenPrices = await getStartAndEndTokenPrices(
      asToken,
      chainId,
      startTime,
      endTime
    );

    const avgTokenPrice = (tokenPrices.startPrice + tokenPrices.endPrice) / 2;
    const avgAsTokenPrice =
      (asTokenPrices.startPrice + asTokenPrices.endPrice) / 2;
    const convertedAmount = amount * (avgAsTokenPrice / avgTokenPrice);

    return {
      isSuccess: true,
      amount: convertedAmount,
      message: `Successfully converted ${amount} ${token} to ${convertedAmount} ${asToken}`,
    } as DenominationResponse;
  } catch (error) {
    console.error(
      `denominateAs : token: ${token}, asToken: ${asToken}, chainId: ${chainId}, startTime: ${startTime}, endTime: ${endTime}`,
      error
    );

    return {
      isSuccess: false,
      amount: amount,
      message: error,
    } as DenominationResponse;
  }
}

/**
 * This is temporary util function to support backward
 * compatibility with older subgraph version
 *
 * TODO: remove after re-indexing mainnet subgraph
 *
 * @param strategyName string
 * @returns string
 */
export const getStrategyName = (strategyName: string) => {
  if (strategyName === "quadraticFunding") {
    return VotingStrategy.LINEAR_QUADRATIC_FUNDING;
  }
  return strategyName;
};

/**
 * fetchTokenPrices is an async function that retrieves the current prices
 * of the tokens in tokenAddresses in USD.
 * If the native token of the chain with id chainId is included in
 * tokenAddresses, its price is also included in the returned data.
 *
 * @param {ChainId} chainId - The id of the chain to retrieve the native token's price from.
 * @param {string[]} tokenAddresses - The addresses of the tokens to retrieve prices for.
 * @return {Promise<TokenPriceMapping>} - An object containing the token addresses as keys and their prices in USD as values.
 */
export const fetchCurrentTokenPrices = async (
  chainId: ChainId,
  tokenAddresses: string[]
): Promise<TokenPriceMapping> => {
  let tokenPrices: TokenPriceMapping = {};
  try {

    // Avoid coingecko calling for testnet
    if(isTestnet(chainId)) {

      let testnetTokenPrices: any = {
        "0x0000000000000000000000000000000000000000":  {
          usd: TESNET_TOKEN_TO_USD_RATE
        }
      };

      tokenAddresses.map(tokenAddress => {
        testnetTokenPrices[tokenAddress] = {
          usd: TESNET_TOKEN_TO_USD_RATE
        };
      });
      return testnetTokenPrices;
    };

    let validAddresses = tokenAddresses.map( (tokenAddress) => {
      getValidTokenAddress(chainId, tokenAddress);
    });

    const { chainName } = getChainName(chainId);

    const tokenPriceEndpoint = `https://api.coingecko.com/api/v3/simple/token_price/${chainName}?contract_addresses=${validAddresses.join(
      ","
    )}&vs_currencies=usd`;

    const resTokenPriceEndpoint = await fetch(tokenPriceEndpoint, {
      headers: {
        Accept: "application/json",
      },
    });

    const tokenPricesResponse = await resTokenPriceEndpoint.json();
    tokenPrices = { ...tokenPrices, ...tokenPricesResponse };

    if (
      tokenAddresses.includes("0x0000000000000000000000000000000000000000") &&
      chainName
    ) {
      const nativePriceEndpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${chainName}&vs_currencies=usd`;
      const resNativePriceEndpoint = await fetch(nativePriceEndpoint, {
        headers: {
          Accept: "application/json",
        },
      });

      const nativeTokenPrice = (await resNativePriceEndpoint.json())[chainName];
      tokenPrices = {
        ...tokenPrices,
        "0x0000000000000000000000000000000000000000": nativeTokenPrice,
      };
    }
  } catch (error) {
    console.error("fetchCurrentTokenPrices", error);
  }

  return tokenPrices;
};

/**
 * Util function to group objects by property
 * @param list
 * @param keyGetter
 * @returns
 */
export function groupBy(list: any[], keyGetter: any) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

export const fetchAverageTokenPrices = async (
  chainId: ChainId,
  tokenAddresses: string[],
  startTime: number,
  endTime: number
) => {
  try {
    // Avoid coingecko calling for testnet
    if(isTestnet(chainId)) {
      let testnetAverageTokenPrices: any = {
        "0x0000000000000000000000000000000000000000": TESNET_TOKEN_TO_USD_RATE,
      };

      tokenAddresses.map(tokenAddress => {
        testnetAverageTokenPrices[tokenAddress] = TESNET_TOKEN_TO_USD_RATE;
      });

      return testnetAverageTokenPrices;
    }

    const { chainName, error } = getChainName(chainId);

    if (error) {
      throw error;
    }

    const averageTokenPrices: AvgTokenPriceMapping = {};

    for (let address of tokenAddresses) {
      averageTokenPrices[address] = 0;
      if (address !== "0x0000000000000000000000000000000000000000") {
        try {
          // get valid address for tokens that are not on coingecko
          let validAddress = getValidTokenAddress(chainId, address);
          const tokenPriceEndpoint = `https://api.coingecko.com/api/v3/coins/${chainName}/contract/${validAddress}/market_chart/range?vs_currency=usd&from=${startTime}&to=${endTime}`;
          const resTokenPriceEndpoint = await fetch(tokenPriceEndpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const tokenPriceData = await resTokenPriceEndpoint.json();

          const { prices, error } = tokenPriceData;

          if (error) {
            averageTokenPrices[address] = -1;
            throw new Error(`${address} is not found on coingecko`);
          }

          const startPrice = prices[0][1];
          const endPrice = prices[prices.length - 1][1];

          const averagePrice = (startPrice + endPrice) / 2;
          averageTokenPrices[address] = averagePrice;
        } catch (error) {
          console.error("fetchAverageTokenPrices", error);
        }
      } else {
        const nativePriceEndpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${chainName}&vs_currencies=usd`;
        const resNativePriceEndpoint = await fetch(nativePriceEndpoint, {
          headers: {
            method: "GET",
            Accept: "application/json",
          },
        });

        const nativePriceData = await resNativePriceEndpoint.json();
        const { usd } = nativePriceData[chainName!];
        averageTokenPrices[address] = usd;
      }
    }
    return averageTokenPrices;
  } catch (error) {
    console.error("fetchAverageTokenPrices", error);
    return { error };
  }
};

/**
 * Generates mapping from payout address to projectId
 *
 * @param {ChainId} chainId - The id of the chain to fetch the votes from.
 * @param {string} votingStrategyId - The id of the voting strategy to retrieve votes for.
 * @return {Promise<Map<string, string>>} - An map of project payout address to project id
 */
export const fetchPayoutAddressToProjectIdMapping = async (
  projectsMetaPtr: MetaPtr
): Promise<Map<string, string>> => {
  type ProjectMetaPtr = {
    id: string;
    status: string;
    payoutAddress: string;
  };

  const pointer = projectsMetaPtr.pointer;

  const payoutToProjectMap: Map<string, string> = new Map();

  let projects: ProjectMetaPtr[] = await fetchFromIPFS(pointer);

  projects = projects.filter((project) => project.status === "APPROVED");

  for (const project of projects) {
    // project.id format ->  applicationId-roundId
    const projectId = project.id.split("-")[0];
    const payoutAddress = getAddress(project.payoutAddress);
    payoutToProjectMap.set(payoutAddress, projectId);
  }

  return payoutToProjectMap;
};

/**
 * Generates mapping from projectId to payout address
 *
 * @param {ChainId} chainId - The id of the chain to fetch the votes from.
 * @param {string} votingStrategyId - The id of the voting strategy to retrieve votes for.
 * @return {Promise<Map<string, string>>} - An map of project id to project payout address
 */
export const fetchProjectIdToPayoutAddressMapping = async (
  projectsMetaPtr: MetaPtr
): Promise<Map<string, string>> => {
  type ProjectMetaPtr = {
    id: string;
    status: string;
    payoutAddress: string;
  };

  const pointer = projectsMetaPtr.pointer;

  const projectToPayoutMap: Map<string, string> = new Map();

  let projects: ProjectMetaPtr[] = await fetchFromIPFS(pointer);

  projects = projects.filter((project) => project.status === "APPROVED");

  for (const project of projects) {
    // project.id format ->  applicationId-roundId
    const projectId = project.id.split("-")[0];
    const payoutAddress = getAddress(project.payoutAddress);
    projectToPayoutMap.set(projectId, payoutAddress);
  }

  return projectToPayoutMap;
};

/**
 * checks if current ChainId is testnet chain
 * @param chainId
 * @returns boolean
 */
export const isTestnet = (chainId: ChainId) => {
  const testnet = [
    ChainId.GOERLI,
    ChainId.FANTOM_TESTNET,
    ChainId.LOCAL_ROUND_LAB
  ];

  return testnet.includes(chainId);
};

/**
 * Util function to specify valid address in scenarios where
 * coingecko doesn't return token price on given chain.
 * Ideally usefully for stable coins
 * 
 * @param chainId
 * @param address 
 * 
 * @returns validAddress
 */
export const getValidTokenAddress = (chainId: ChainId, address: string) => {
  let validAddress = address;
  if (chainId == ChainId.FANTOM_MAINNET) {
    if (address == "0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50") { // BUSD
      validAddress = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e" // DAI
    }
  }
  return validAddress;
}