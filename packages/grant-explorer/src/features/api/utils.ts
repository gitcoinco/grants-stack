import { IPFSObject } from "./types"

export enum ChainId {
  GOERLI_CHAIN_ID = 5,
  OPTIMISM_MAINNET_CHAIN_ID = 10,
  OPTIMISM_KOVAN_CHAIN_ID = 69,
}

/**
 * Fetch subgraph network for provided web3 network
 *
 * @param chainId - The chain ID of the blockchain2
 * @returns the subgraph endpoint
 */
const getGraphQLEndpoint = async (chainId: ChainId) => {
  let endpoint;

  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      endpoint = `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`;
      break;
    }
    case ChainId.OPTIMISM_KOVAN_CHAIN_ID: {
      endpoint = `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_KOVAN_API}`;
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      endpoint = `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`;
    }
  }

  return endpoint;
};

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param query - The query to be executed
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param variables - The variables to be used in the query
 * @returns The result of the query
 */
export const graphql_fetch = async (
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
    body: JSON.stringify({ query, variables }),
  }).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp);
  });
};


/**
 * Fetch data from IPFS
 * TODO: include support for fetching abitrary data e.g images
 *
 * @param cid - the unique content identifier that points to the data
 */
 export const fetchFromIPFS = (cid: string) => {
  return fetch(`https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`).then(resp => {
    if (resp.ok) {
      return resp.json()
    }

    return Promise.reject(resp)
  })
}

/**
 * Pin data to IPFS
 * The data could either be a file or a JSON object
 *
 * @param obj - the data to be pinned on IPFS
 * @returns the unique content identifier that points to the data
 */
 export const pinToIPFS = (obj: IPFSObject) => {

  let params: any = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.REACT_APP_PINATA_JWT}`
    },
    body: {
      pinataMetadata: obj.metadata,
      pinataOptions: {
        cidVersion: 1
      }
    }
  }

  /* typeof Blob === 'object', so we need to check against instanceof */
  if (obj.content instanceof Blob) {
    // content is a blob
    const fd = new FormData();
    fd.append("file", obj.content as Blob)
    fd.append("pinataOptions", JSON.stringify(params.body.pinataOptions))
    fd.append("pinataMetadata", JSON.stringify(params.body.pinataMetadata))

    return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {...params, body: fd}
    ).then(resp => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp)
    })
  } else {
    // content is a JSON object
    return fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({...params.body, pinataContent: obj.content})
    }).then(resp => {
      if (resp.ok) {
        return resp.json()
      }

      return Promise.reject(resp)
    })
  }
}


export const abbreviateAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-4)}`

// Checks if tests are being run jest
export const isJestRunning = () => process.env.JEST_WORKER_ID !== undefined;
