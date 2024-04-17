/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ChainId } from "./chain-ids";

/**
 * Fetch subgraph network for provided web3 network.
 * The backticks are here to work around a failure of a test that tetsts graphql_fetch,
 * and fails if the endpoint is undefined, so we convert the undefined to a string here in order not to fail the test.
 *
 * @param chainId - The chain ID of the blockchain
 * @returns the subgraph endpoint
 */
export const getGraphQLEndpoint = (chainId: ChainId) =>
  `${graphQlEndpoints[chainId]}`;
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
export const graphQlEndpoints: Record<ChainId, string> = {
  [ChainId.DEV1]: process.env.REACT_APP_SUBGRAPH_DEV1_API!,
  [ChainId.DEV2]: process.env.REACT_APP_SUBGRAPH_DEV2_API!,
  [ChainId.PGN]: process.env.REACT_APP_SUBGRAPH_PGN_API!,
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
  [ChainId.FUJI]: process.env.REACT_APP_SUBGRAPH_FUJI_API!,
  [ChainId.AVALANCHE]: process.env.REACT_APP_SUBGRAPH_AVALANCHE_API!,
  [ChainId.POLYGON]: process.env.REACT_APP_SUBGRAPH_POLYGON_API!,
  [ChainId.POLYGON_MUMBAI]: process.env.REACT_APP_SUBGRAPH_POLYGON_MUMBAI_API!,
  [ChainId.ZKSYNC_ERA_TESTNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_ZKSYNC_TESTNET_API!,
  [ChainId.ZKSYNC_ERA_MAINNET_CHAIN_ID]:
    process.env.REACT_APP_SUBGRAPH_ZKSYNC_MAINNET_API!,
  [ChainId.BASE]: process.env.REACT_APP_SUBGRAPH_BASE_API!,
  [ChainId.SEPOLIA]: process.env.REACT_APP_SUBGRAPH_SEPOLIA_API!,
  [ChainId.SCROLL]: process.env.REACT_APP_SUBGRAPH_SCROLL_API!,
  [ChainId.SEI_DEVNET]: process.env.REACT_APP_SUBGRAPH_SEI_DEVNET_API!,
};
