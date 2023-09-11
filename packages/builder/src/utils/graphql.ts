import { ChainId } from "common";

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
 * Fetch subgraph uri for a given chain id
 *
 * @param chainId
 * @returns GraphEndpoint
 */
const getGraphQLEndpoint = (chainId: ChainId): string =>
  graphQlEndpoints[chainId];

// eslint-disable-next-line import/prefer-default-export
export const graphqlFetch = async (
  query: string,
  chainId: ChainId,
  variables: object = {}
) => {
  const endpoint = getGraphQLEndpoint(chainId);
  if (endpoint) {
    return fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      return Promise.reject(resp);
    });
  }

  throw new Error(`Subgraph endpoint for chain id ${chainId} not defined.`);
};
