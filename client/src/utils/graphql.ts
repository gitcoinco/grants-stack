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
 * @returns subgraph uri: string
 */
const getGraphQLEndpoint = async (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.GOERLI_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_URL_GOERLI}`;
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_URL_OPTIMISM_MAINNET}`;
    case ChainId.FANTOM_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_URL_FANTOM_MAINNET}`;
    case ChainId.FANTOM_TESTNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_URL_FANTOM_TESTNET}`;
    default:
      // ??? not sure what the default should be ???
      return `${process.env.REACT_APP_SUBGRAPH_URL_GOERLI}`;
  }
};

export const graphqlFetch = async (
  query: string,
  chainId: ChainId,
  variables: object = {}
) => {
  const endpoint = await getGraphQLEndpoint(chainId);
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
};
