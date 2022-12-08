import { env } from "process";

/**
 * Chain Id to network id
 */
export enum ChainId {
  MAINNET_CHAIN_ID = 1,
  GOERLI_CHAIN_ID = 5,
  OPTIMISM_MAINNET_CHAIN_ID = 10,
  FANTOM_MAINNET_CHAIN_ID = 250,
  FANTOM_TESTNET_CHAIN_ID = 0xfa2,
}

export type GraphEndpoint = {
  uri: string | undefined;
  error: string | undefined;
};

/**
 * Fetch subgraph uri for a given chain id
 *
 * @param chainId
 * @returns GraphEndpoint
 */
const getGraphQLEndpoint = (
  chainId: number,
  reactEnv?: any // ProcessEnv
): GraphEndpoint => {
  const environment = reactEnv || env;
  switch (chainId) {
    case ChainId.MAINNET_CHAIN_ID:
      return {
        // eslint-disable-next-line max-len
        uri: `https://gateway.thegraph.com/api/${environment.REACT_APP_SUBGRAPH_MAINNET_API_KEY}/subgraphs/id/94TgNF87pKDcuhFkELKQa6o3CcetJvyt3XwkhtsvhrHx`,
        error: undefined,
      };
    case ChainId.GOERLI_CHAIN_ID:
      return {
        uri: "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-goerli-testnet",
        error: undefined,
      };
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
      return {
        uri: "https://api.thegraph.com/subgraphs/name/thelostone-mc/grants-round-optimism-mainnet",
        error: undefined,
      };
    case ChainId.FANTOM_MAINNET_CHAIN_ID:
      return {
        uri: "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-mainnet",
        error: undefined,
      };
    case ChainId.FANTOM_TESTNET_CHAIN_ID:
      return {
        uri: "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-testnet",
        error: undefined,
      };
    default:
      return {
        uri: undefined,
        error: "Invalid chain id or subgraph not deployed on requested chain",
      };
  }
};

export const graphqlFetch = async (
  query: string,
  chainId: number,
  variables: object = {},
  reactEnv?: any // ProcessEnv
) => {
  const endpoint: GraphEndpoint = getGraphQLEndpoint(chainId, reactEnv);
  if (!endpoint.error && endpoint.uri) {
    return fetch(endpoint.uri, {
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
  return Promise.reject(endpoint.error);
};
