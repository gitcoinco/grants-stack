import { create as IPFSCreate } from "ipfs-core"
import { global } from "../../../global"
import { api } from ".."
import { IPFSFile } from "../types"


export const ipfsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    saveToIPFS: builder.mutation<string, IPFSFile>({
      queryFn: async (file) => {
        let result = { data: "" }

        try {
          if (global.ipfs === undefined) {
            global.ipfs = await IPFSCreate({ repo: 'ok' + Math.random() })
          }

          const res = await global.ipfs!.add({
            path: file.path,
            content: new TextEncoder().encode(file.content)
          })

          console.log('Added file to IPFS:', res.path, res.cid.toString())
          result.data = res.cid.toString()

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