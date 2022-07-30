import { providers } from "ethers"
import { IPFSObject, MetadataPointer, Network } from "./types"


/**
 * Fetch chain details for the provided network
 * 
 * @param network - The network to be initialized
 * @returns { chainId, name }
 */
export const getWeb3Instance = async (network: Network) => {
  const provider = new providers.InfuraProvider(network, process.env.REACT_APP_INFURA_ID)

  // Fetch network details
  const { chainId, name } = await provider!.getNetwork()
  return { chainId, name }
}


/**
 * Fetch subgraph network for provided web3 network
 * 
 * @param network - The network to be initialized
 * @returns the subgraph endpoint
 */
const getGraphQLEndpoint = async (network: Network) => {
  // fetch chain id
  const chainId = (await getWeb3Instance(network))?.chainId

  let endpoint

  switch (chainId) {
    case 10: {
      // optimism network
      endpoint = `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`
      break
    }
    case 69: {
      // optimism-kovan network
      endpoint = `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_KOVAN_API}`
      break
    }
    default: {
      // goerli network
      endpoint = `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`
    }
  }

  return endpoint;
}


/**
 * Fetch data from a GraphQL endpoint
 *
 * @param query - The query to be executed
 * @param network - The EVM network indexed by the subgraph
 * @param variables - The variables to be used in the query
 * @returns The result of the query
 */
export const graphql_fetch = async (
  query: string,
  network: Network,
  variables: object = {},
) => {

  const endpoint = await getGraphQLEndpoint(network);

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables })
  }).then(resp => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp)
  })
}


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
 * Check status of a grant application
 * 
 * @param id - the application id
 * @param projectsMetaPtr - the pointer to a decentralized storage
 */
export const checkGrantApplicationStatus = async (id: string, projectsMetaPtr: MetadataPointer) => {
  let reviewedApplications: any = []

  // read data from ipfs
  if (projectsMetaPtr) {
    reviewedApplications = await fetchFromIPFS(projectsMetaPtr.pointer)
  }

  const obj = reviewedApplications.find((o: any) => o.id === id)

  return obj ? obj.status : "PENDING"
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

  if (typeof obj.content === 'object') {
    // content is a JSON object
    return fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...params.body, pinataContent: obj.content })
    }).then(resp => {
      if (resp.ok) {
        return resp.json()
      }

      return Promise.reject(resp)
    })
  } else {
    // content is a blob
    const fd = new FormData();
    fd.append("file", obj.content)
    fd.append("pinataOptions", JSON.stringify(params.body.pinataOptions))
    fd.append("pinataMetadata", JSON.stringify(params.body.pinataMetadata))

    return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", { ...params, body: fd }
    ).then(resp => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp)
    })
  }
}


/**
 * Converts camelCaseText to Title Case Text
 */
const camelToTitle = (camelCase: string) => camelCase
  .replace(/([A-Z])/g, (match) => ` ${match}`)
  .replace(/^./, (match) => match.toUpperCase())
  .trim()


/**
 * This function generates the round application schema to be stored in a decentralized storage
 *
 * @param metadata - The metadata of a round application
 * @returns The application schema
 */
export const generateApplicationSchema = (metadata: any) => {

  // declare schema with default fields
  let schema = [];

  for (const key of Object.keys(metadata)) {
    if (typeof metadata[key] === "object") {

      for (const subKey of Object.keys(metadata[key])) {
        schema.push({
          id: schema.length,
          question: camelToTitle(subKey),
          type: "TEXT",
          required: true,
          info: metadata[key][subKey],
          choices: []
        })
      }
      continue

    } else {
      schema.push({
        id: schema.length,
        question: camelToTitle(key),
        type: "TEXT",
        required: true,
        info: metadata[key],
        choices: []
      })
    }
  }

  return schema
}
