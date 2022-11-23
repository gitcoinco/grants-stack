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
 * Fetch data from a GraphQL endpoint
 *
 * @param votingStrategyId - The voting strategy address
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @returns The result of the query
 */
 export const fetchVotes = async (
  votingStrategyId: string,
  chainId: string
) => {

  const endpoint = await getGraphQLEndpoint(chainId as ChainId);
  const variables = { votingStrategyId };

  const query =`
    query GetVotes($votingStrategyId: String) {
      votingStrategies(where:{
        id: $votingStrategyId
      }) {
        votes {
          id
          amount
          token
          from
          to
        }
      }
    }
  `;

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
