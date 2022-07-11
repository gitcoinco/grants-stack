import { IPFSObject } from "./types"


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
 * @returns - The application schema
 */
export const generateApplicationSchema = (metadata: any) => {

  // declare schema with default fields
  let schema = [
    {
      question: "Project Name",
      type: "TEXT",
      required: true,
      info: "",
      choices: []
    },
    {
      question: "Wallet Address",
      type: "TEXT",
      required: true,
      info: "",
      choices: []
    }
  ]

  for (const key of Object.keys(metadata)) {
    if (typeof metadata[key] === "object") {

      for (const subKey of Object.keys(metadata[key])) {
        schema.push({
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