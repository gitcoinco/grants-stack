import { IPFSObject } from "./types";

export enum ChainId {
  GOERLI_CHAIN_ID = 5,
  OPTIMISM_MAINNET_CHAIN_ID = 10,
}

/**
 * Fetch subgraph network for provided web3 network
 *
 * @param chainId - The chain ID of the blockchain2
 * @returns the subgraph endpoint
 */
const getGraphQLEndpoint = async (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID:
      return `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`;

    case ChainId.GOERLI_CHAIN_ID:
    default:
      return `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`;
  }
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
  return fetch(
    `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`
  ).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }

    return Promise.reject(resp);
  });
};

/**
 * Pin data to IPFS
 * The data could either be a file or a JSON object
 *
 * @param obj - the data to be pinned on IPFS
 * @returns the unique content identifier that points to the data
 */
export const pinToIPFS = (obj: IPFSObject) => {
  const params: any = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
    },
    body: {
      pinataMetadata: obj.metadata,
      pinataOptions: {
        cidVersion: 1,
      },
    },
  };

  /* typeof Blob === 'object', so we need to check against instanceof */
  if (obj.content instanceof Blob) {
    // content is a blob
    const fd = new FormData();
    fd.append("file", obj.content as Blob);
    fd.append("pinataOptions", JSON.stringify(params.body.pinataOptions));
    fd.append("pinataMetadata", JSON.stringify(params.body.pinataMetadata));

    return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      ...params,
      body: fd,
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  } else {
    // content is a JSON object
    return fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...params.body, pinataContent: obj.content }),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  }
};

/**
 * Converts camelCaseText to Title Case Text
 */
const camelToTitle = (camelCase: string) =>
  camelCase
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase())
    .trim();

export const abbreviateAddress = (address: string) =>
  `${address.slice(0, 8)}...${address.slice(-4)}`;

type InputType = "email" | "number" | "text";
type QuestionInputTypeMap = Record<string, InputType>;

/* Static for now, will be integrated directly into the question object itself for dynamic fields */
export const inputTypes: QuestionInputTypeMap = {
  email: "email",
  fundingSource: "text",
  profit2022: "number",
  teamSize: "number",
};

type QuestionHumanReadableLabelsMap = Record<string, string>;
export const humanReadableLabels: QuestionHumanReadableLabelsMap = {
  email: "Email Address",
  fundingSource: "Funding Sources",
  profit2022: "2022 Profit",
  teamSize: "Team Size",
};

export interface SchemaQuestion {
  id: number;
  question: string;
  type: InputType;
  required: true;
  info: string;
  choices: [];
  encrypted: boolean;
}

/**
 * This function generates the round application schema to be stored in a decentralized storage
 *
 * @param metadata - The metadata of a round application
 * @returns The application schema
 */
export const generateApplicationSchema = (
  metadata: any
): Array<SchemaQuestion> => {
  if (!metadata.customQuestions) return [];

  const schema: Array<SchemaQuestion> = [];

  for (const key of Object.keys(metadata)) {
    if (typeof metadata[key] === "object") {
      generateQuestionGroup(metadata[key], schema);
    } else {
      generateQuestion(key, metadata[key], schema);
    }
  }

  return schema;
};

function generateQuestionGroup(
  questionGroup: { [key: string]: string },
  schema: Array<SchemaQuestion>
) {
  for (const question of Object.keys(questionGroup)) {
    schema.push({
      id: schema.length,
      question: humanReadableLabels[question] || camelToTitle(question),
      type: inputTypes[question] || "text",
      required: true,
      info: questionGroup[question],
      choices: [],
      encrypted: question === "email",
    });
  }
}

function generateQuestion(
  question: string,
  info: string,
  schema: Array<SchemaQuestion>
) {
  schema.push({
    id: schema.length,
    question: camelToTitle(question),
    type: "text",
    required: true,
    info,
    choices: [],
    encrypted: question === "email",
  });
}

// Checks if tests are being run jest
export const isJestRunning = () => process.env.JEST_WORKER_ID !== undefined;
