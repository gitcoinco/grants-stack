import { IPFSObject } from "../types"
import { fetchFromIPFS, pinToIPFS } from "../utils"
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
      invalidatesTags: ["IPFS"]
    }),
    readFromIPFS: builder.query<string, string>({
      queryFn: async (cid) => {
        try {
          const data = await fetchFromIPFS(cid)

          return { data }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to fetch file from IPFS" }
        }
      },
      providesTags: ["IPFS"]
    })
  }),
  overrideExisting: false
})

export const { useSaveToIPFSMutation, useReadFromIPFSQuery } = ipfsApi