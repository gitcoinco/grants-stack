import { create as IPFSCreate } from "ipfs-core"
import { global } from "../../../global"
import { IPFSObject } from "../types"
import { pinToIPFS } from "../utils"
import { api } from ".."


export const ipfsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    saveToIPFS: builder.mutation<string, IPFSObject>({
      queryFn: async (object) => {
        let result = { data: "" }

        try {
          const resp = await pinToIPFS(object)

          console.log('Added file to IPFS:', resp.IpfsHash)
          result.data = resp.IpfsHash

          return result

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to save file to IPFS" }
        }
      },
    }),
    readFromIPFS: builder.query<string, string>({
      queryFn: async (cid) => {
        try {
          if (global.ipfs === undefined) {
            global.ipfs = await IPFSCreate({ repo: 'ok' + Math.random() })
          }

          const decoder = new TextDecoder()
          let content = ''

          for await (const chunk of global.ipfs.cat(cid)) {
            content += decoder.decode(chunk)
          }

          return { data: content }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to fetch file from IPFS" }
        }
      },
    })
  }),
  overrideExisting: false
})

export const { useSaveToIPFSMutation, useReadFromIPFSQuery } = ipfsApi