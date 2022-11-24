import { RoundMetadata } from "../types";

export enum ChainId {
  GOERLI_CHAIN_ID = '5',
  OPTIMISM_MAINNET_CHAIN_ID = '10',
  FANTOM_MAINNET_CHAIN_ID = '250',
  FANTOM_TESTNET_CHAIN_ID = '4002',
}

/**
 * Fetch subgraph network for provided web3 network
 *
 * @param chainId - The chain ID of the blockchain2
 * @returns the subgraph endpoint
 */
export const getGraphQLEndpoint = async (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
      return "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet";

    case ChainId.FANTOM_MAINNET_CHAIN_ID:
      return "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-mainnet";

    case ChainId.FANTOM_TESTNET_CHAIN_ID:
      return "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-testnet";

    case ChainId.GOERLI_CHAIN_ID:
    default:
      return "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-goerli-testnet";
  }
};


/**
 * Fetch data from IPFS
 * TODO: include support for fetching abitrary data e.g images
 *
 * @param cid - the unique content identifier that points to the data
 */
 export const fetchFromIPFS = (cid: string) => {
  const REACT_APP_PINATA_GATEWAY = "gitcoin.mypinata.cloud";

  return fetch(`https://${REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`).then(resp => {
    if (resp.ok) {
      return resp.json()
    }

    return Promise.reject(resp)
  })
}

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
  variables: object = {},
) => {
  let endpoint = await getGraphQLEndpoint(chainId);

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
 * Fetch metadata using votingStrategyId
 *
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param votingStrategyId - The voting strategy address
 *
 * @returns Promise<RoundMetadata>
 */
 export const fetchMetadataByVotingStrategyId = async (
  chainId: ChainId,
  votingStrategyId: string,
) : Promise<RoundMetadata> => {

  const variables = { votingStrategyId };

  const query =`
    query GetMetadata($votingStrategyId: String) {
      votingStrategies(where:{
        id: $votingStrategyId
      }) {
        strategyName
        round {
          token
          roundMetaPtr {
            protocol
            pointer
          }
        }
      }
    }
  `;

  // fetch from graphql
  const response = await fetchFromGraphQL(
    chainId,
    query,
    variables,
  )

  const votingStrategy = response.data.votingStrategies[0];

  // fetch round metadata
  const round = votingStrategy.round;
  const roundMetadata = await fetchFromIPFS(round.roundMetaPtr.pointer);
  const totalPot = roundMetadata.matchingFunds.matchingFundsAvailable;

  const metadata: RoundMetadata = {
    votingStrategyName: votingStrategy.votingStrategyName,
    token: round.token,
    totalPot: totalPot
  }

  return metadata;
};