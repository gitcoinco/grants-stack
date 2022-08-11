import {ApplicationMetadata, IPFSObject, MetadataPointer} from "./types"

export enum ChainId {
  GOERLI_CHAIN_ID= 5,
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
  let endpoint

  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      endpoint = `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`
      break
    }
    case ChainId.OPTIMISM_KOVAN_CHAIN_ID: {
      endpoint = `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_KOVAN_API}`
      break
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      endpoint = `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`
    }
  }

  return endpoint;
}


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
  variables: object = {},
) => {

  const endpoint = await getGraphQLEndpoint(chainId);

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

export const abbreviateAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-4)}`

export interface SchemaQuestion {
  id: number,
  question: string,
  type: "TEXT",
  required: true,
  info: string,
  choices: [],
  encrypted: boolean
}

/**
 * This function generates the round application schema to be stored in a decentralized storage
 *
 * @param metadata - The metadata of a round application
 * @returns The application schema
 */
export const generateApplicationSchema = (metadata: ApplicationMetadata): Array<SchemaQuestion> => {
  if (!metadata.customQuestions) return []

  const maybeQuestions = metadata.customQuestions

  const isPresent = (item: (string | undefined)[]): item is string[] => {
    return !!item[1]
  }

  // TODO(Aditya) Revisit code here to potentially package things in a dynamic way
  const questions = [
    ["email", maybeQuestions.email],
    ["twitter", maybeQuestions.twitter],
    ["website", maybeQuestions.website],
    ["github", maybeQuestions.github],
    ["githubOrganization", maybeQuestions.githubOrganization],
    ["fundingSource", maybeQuestions.fundingSource],
    ["profit2022", maybeQuestions.profit2022],
    ["teamSize", maybeQuestions.teamSize]
  ].filter(isPresent)

  return questions.map(([name , answer], i) => {
    return {
      id: i,
      question: camelToTitle(name),
      type: "TEXT",
      required: true,
      info: answer,
      choices: [],
      encrypted: name === 'email'
    }
  })
}
