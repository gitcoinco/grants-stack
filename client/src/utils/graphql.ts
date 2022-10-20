/**
 * Chain Id to network id
 */
export enum ChainId {
  GOERLI_CHAIN_ID = 5,
  OPTIMISM_MAINNET_CHAIN_ID = 10,
  FANTOM_MAINNET_CHAIN_ID = 250,
  FANTOM_TESTNET_CHAIN_ID = 0xfa2,
}

/**
 * Fetch subgraph uri for a given chain id
 *
 * @param chainId
 * @returns { uri: string | undefined, error: string | undefined }
 */
const getGraphQLEndpoint = async (
  chainId: ChainId
): Promise<{ uri: string | undefined; error: string | undefined }> => {
  switch (chainId) {
    case ChainId.GOERLI_CHAIN_ID:
      return {
        uri: process.env.REACT_APP_SUBGRAPH_URL_GOERLI,
        error: undefined,
      };
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
      return {
        uri: process.env.REACT_APP_SUBGRAPH_URL_OPTIMISM_MAINNET,
        error: undefined,
      };
    case ChainId.FANTOM_MAINNET_CHAIN_ID:
      return {
        uri: process.env.REACT_APP_SUBGRAPH_URL_FANTOM_MAINNET,
        error: undefined,
      };
    case ChainId.FANTOM_TESTNET_CHAIN_ID:
      return {
        uri: process.env.REACT_APP_SUBGRAPH_URL_FANTOM_TESTNET,
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
  chainId: ChainId,
  variables: object = {}
) => {
  const endpoint = await getGraphQLEndpoint(chainId);
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
