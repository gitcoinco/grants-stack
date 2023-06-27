import { ChainId } from "common";

export type GraphQLEndpoints = {
  [key in ChainId]: string;
};

const graphQlEndpoints: GraphQLEndpoints = {
  [ChainId.MAINNET]: process.env.REACT_APP_SUBGRAPH_URL_MAINNET!,
  [ChainId.GOERLI_CHAIN_ID]: process.env.REACT_APP_SUBGRAPH_URL_GOERLI!,
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_URL_OPTIMISM_MAINNET!,
  [ChainId.FANTOM_MAINNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_URL_FANTOM_MAINNET!,
  [ChainId.FANTOM_TESTNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_URL_FANTOM_TESTNET!,
  [ChainId.PGN_TESTNET]: process.env.REACT_APP_SUBGRAPH_URL_PGN_TESTNET!,
};

/**
 * Fetch subgraph uri for a given chain id
 *
 * @param chainId
 * @returns GraphEndpoint
 */
const getGraphQLEndpoint = (chainId: ChainId): string =>
  graphQlEndpoints[chainId];

export default async (
  query: string,
  chainId: number,
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
