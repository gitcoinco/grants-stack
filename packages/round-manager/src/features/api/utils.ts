import { create as IPFSCreate } from "ipfs-core"

import { global } from "../../global"

/**
 * Fetch data from IPFS
 * 
 * @param cid - the unique content identifier that points to the data
 */
export const fetchFromIPFS = async (cid: string) => {
  if (global.ipfs === undefined) {
    global.ipfs = await IPFSCreate({ repo: 'ok' + Math.random() })
  }

  const decoder = new TextDecoder()
  let content = ''

  for await (const chunk of global.ipfs.cat(cid)) {
    content += decoder.decode(chunk)
  }

  return content
}


/**
 * Converts camelCaseText to Title Case Text
 */
const camelToTitle = (camelCase: string) => camelCase
  .replace(/([A-Z])/g, (match) => ` ${match}`)
  .replace(/^./, (match) => match.toUpperCase())
  .trim()


/**
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