import { ChainId, RoundMetadata } from "../types";

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

  // fetch round metadata
  const roundMetadata = await fetchFromIPFS(response.data.roundMetaPtr.pointer);
  const totalPot = roundMetadata.matchingFunds.matchingFundsAvailable;

  const metadata: RoundMetadata = {
    votingStrategy: { ...response.data.votingStrategy },
    token: response.data.token,
    totalPot: totalPot,
  };

  return metadata;
};
