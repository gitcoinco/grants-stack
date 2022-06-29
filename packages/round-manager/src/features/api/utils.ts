import { create as IPFSCreate } from "ipfs-core"

import { global } from "../../global"

/**
 * Fetch data from IPFS
 * @param cid the unique content identifier that points to the data
 * @returns
 */
export const fetchFromIPFS = async (cid: string) => {
  if (global.ipfs === undefined) {
    global.ipfs = await IPFSCreate()
  }

  const decoder = new TextDecoder()
  let content = ''

  for await (const chunk of global.ipfs.cat(cid)) {
    content += decoder.decode(chunk)
  }

  return content
}