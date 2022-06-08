import { ethers } from "ethers"
import { api } from ".."
import { global } from "../../../global"
import { programFactoryContract } from "../contracts"
import { Program } from "../types"


export const programApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProgram: builder.mutation<string, Program>({
      queryFn: async ({ metadataIdentifier, operatorWallets }) => {
        try {
          const programFactory = new ethers.Contract(
            programFactoryContract.address,
            programFactoryContract.abi,
            global.web3Signer
          )

          // Deploys a new Program contract
          // Learn about the metadata pointer here: 
          // https://github.com/gitcoinco/grants-round/blob/main/packages/contracts/docs/MetaPtrProtocol.md
          let tx = await programFactory.create(
            { protocol: 1, pointer: metadataIdentifier },
            operatorWallets.filter(e => e !== "")
          )

          await tx.wait() // wait for transaction receipt

          console.log("Deployed program contract:", tx.hash)

          return { data: tx.hash }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to create program" }
        }
      },
      invalidatesTags: ['Program']
    }),
    updateProgram: builder.mutation<string, Program>({
      queryFn: async ({ id, ...program }) => {
        try {
          let res = "TODO"

          return { data: res }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to update program" }
        }
      },
    }),
    listPrograms: builder.query<Program[], void>({
      queryFn: async () => {
        try {
          let res = [{
            metadataIdentifier: "TODO",
            operatorWallets: []
          }]

          return { data: res }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to fetch programs" }
        }
      },
    }),
    deleteProgram: builder.mutation<string, string>({
      queryFn: async (id) => {
        try {
          let res = "TODO"

          return { data: res }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to delete program" }
        }
      },
    }),
  }),
  overrideExisting: false
})

export const {
  useListProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation
} = programApi