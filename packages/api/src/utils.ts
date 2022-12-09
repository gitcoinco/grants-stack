import { Response } from "express";
import fetch from "node-fetch";
import { ChainId, ChainName, RoundMetadata, DenominationResponse } from "./types";

/**
 * Fetch subgraph network for provided web3 network
 *
 * @param chainId - The chain ID of the blockchain
 * @returns the subgraph endpoint
 */
export const getGraphQLEndpoint = (chainId: ChainId) => {
  // TODO: the urls should be environment variables
  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET:
      return "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet";

    case ChainId.FANTOM_MAINNET:
      return "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-mainnet";

    case ChainId.FANTOM_TESTNET:
      return "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-testnet";

    case ChainId.GOERLI:
      return "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-goerli-testnet";

    default:
      return "https://api.thegraph.com/subgraphs/name/thelostone-mc/round-labs";
  }
};

export const getChainVerbose = (id: string) => {
  switch (id) {
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
 * TODO: include support for fetching abitrary data e.g images
 *
 * @param cid - the unique content identifier that points to the data
 */
export const fetchFromIPFS = async (cid: string) => {
  const REACT_APP_PINATA_GATEWAY = "gitcoin.mypinata.cloud";

  return fetch(`https://${REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`).then(
    (resp: any) => {
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
  }).then((resp: any) => {
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
  roundId: string
): Promise<RoundMetadata> => {
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
      }
    }
  `;

  // fetch from graphql
  const response = await fetchFromGraphQL(chainId, query, variables);

  const data = response.data?.rounds[0];

  // fetch round metadata
  const roundMetadata = await fetchFromIPFS(data?.roundMetaPtr.pointer);
  const totalPot = roundMetadata.matchingFunds.matchingFundsAvailable;

  const metadata: RoundMetadata = {
    votingStrategy: {
      id: data?.votingStrategy.id,
      strategyName: data?.votingStrategy.strategyName,
    },
    roundStartTime: data?.roundStartTime,
    roundEndTime: data?.roundEndTime,
    token: data?.token,
    totalPot: totalPot,
  };

  return metadata;
};

export const handleResponse = (
  res: Response,
  code: number,
  message: string,
  body?: any
) => {
  let success: boolean = false;

  if (code >= 200 && code < 400) {
    success = true;
  }

  res.json({
    success,
    message,
    data: body ?? {},
  });
};

// NOTE: This should probably be moved to a separate file for constants
const coingeckoSupportedChainNames: Record<number, string> = {
  [ChainId.MAINNET]: "ethereum",
  [ChainId.OPTIMISM_MAINNET]: "optimism",
  [ChainId.FANTOM_MAINNET]: "fantom",
};

export async function getPriceForToken(contract: string, chain: ChainName) {
  return await fetch(
    `https://api.coingecko.com/api/v3/coins/${chain}/contract/${contract}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((res) => res.market_data.current_price);
}

export async function getStartAndEndTokenPrices(
    contract: string,
    chainId: ChainId,
    startTime: number,
    endTime: number
): Promise<{ startPrice: number, endPrice: number }> {
  const chainName = coingeckoSupportedChainNames[chainId];
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${chainName}/contract/${contract}/market_chart/range?vs_currency=usd&from=${startTime}&to=${endTime}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    const data = await res.json();
    // NOTE: If the start or end time is out of range, the API will return the closest price to the start or end time
    //       by selecting the first and last element in the array
    //       We should consider storing this information in the future.
    const startPrice = data.prices[0][1];
    const endPrice = data.prices[data.prices.length - 1][1];
    return { startPrice, endPrice };
  } catch (err) {
    throw err;
  }
}

export async function denominateAs(
  token: string,
  asToken: string,
  amount: number,
  startTime: number,
  endTime: number,
  chainId: ChainId,
): Promise<DenominationResponse> {
  // token = "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50"
  // asToken = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"
  // chainId = ChainId.FANTOM_MAINNET

  // token = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
  // asToken = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
  // chainId = ChainId.OPTIMISM_MAINNET

  // TODO: Export this to constants
  const coingeckoSupportedChainNames: Record<number, string> = {
    [ChainId.MAINNET]: "ethereum",
    [ChainId.OPTIMISM_MAINNET]: "optimistic-ethereum",
    [ChainId.FANTOM_MAINNET]: "fantom",
  };
  
  if (!coingeckoSupportedChainNames[chainId]) {
    return {
      isSuccess: false,
      amount: amount,
      message: new Error(`ChainId ${chainId} is not supported by CoinGecko's API.`),
    } as DenominationResponse;
  }

  try {

    const tokenPrices = await getStartAndEndTokenPrices(token, chainId, startTime, endTime);
    const asTokenPrices = await getStartAndEndTokenPrices(asToken, chainId, startTime, endTime);

    const avgTokenPrice = (tokenPrices.startPrice + tokenPrices.endPrice) / 2;
    const avgAsTokenPrice = (asTokenPrices.startPrice + asTokenPrices.endPrice) / 2;
    const convertedAmount = amount * (avgAsTokenPrice / avgTokenPrice);

    return {
      isSuccess: true,
      amount: convertedAmount,
      message: `Successfully converted ${amount} ${token} to ${convertedAmount} ${asToken}`,
    } as DenominationResponse;

  } catch (err) {

    return {
      isSuccess: false,
      amount: amount,
      message: err,
    } as DenominationResponse;

  }

}


