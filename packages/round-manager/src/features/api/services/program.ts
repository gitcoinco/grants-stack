import { ethers } from "ethers"
import { create as IPFSCreate } from "ipfs-core"
import { api } from ".."
import { global } from "../../../global"
import { programFactoryContract, programImplementationContract } from "../contracts"
import { Program } from "../types"


export const programApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProgram: builder.mutation<string, Program>({
      queryFn: async ({ store: metadata, operatorWallets }) => {
        try {
          const programFactory = new ethers.Contract(
            programFactoryContract.address!,
            programFactoryContract.abi,
            global.web3Signer
          )

          // Deploy a new Program contract
          let tx = await programFactory.create(
            { protocol: metadata!.protocol, pointer: metadata!.pointer },
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
    listPrograms: builder.query<Program[], string>({
      queryFn: async (account) => {
        try {
          account = ethers.utils.getAddress(account)

          const programFactory = new ethers.Contract(
            programFactoryContract.address!,
            programFactoryContract.abi,
            global.web3Provider
          )

          // Create event filter and query programs created from past events
          const filter = programFactory.filters.ProgramCreated()
          const events = await programFactory.queryFilter(filter)

          const programs: Program[] = []

          // Loop through past events to filter programs for which the connected account
          // has the required operator permission
          for (const event of events) {
            const programImplementation = new ethers.Contract(
              event.args![0],
              programImplementationContract.abi,
              global.web3Provider
            )

            const PROGRAM_OPERATOR_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROGRAM_OPERATOR"))

            const isOperator = await programImplementation.hasRole(
              PROGRAM_OPERATOR_ROLE,
              account
            )

            if (isOperator) {
              // Connected wallet is a Program Operator
              const metadata = await programImplementation.metaPtr()

              // Fetch operator wallets for the program
              const operatorCount = await programImplementation.getRoleMemberCount(PROGRAM_OPERATOR_ROLE)

              const operatorWallets = [];
              for (let i = 0; i < operatorCount; ++i) {
                operatorWallets.push(await programImplementation.getRoleMember(PROGRAM_OPERATOR_ROLE, i))
              }

              // Fetch metadata from ipfs
              if (global.ipfs === undefined) {
                global.ipfs = await IPFSCreate()
              }

              const decoder = new TextDecoder()
              let content = ''

              for await (const chunk of global.ipfs.cat(metadata[1])) {
                content += decoder.decode(chunk)
              }

              // Add program to response
              programs.push({ id: event.args![0], metadata: JSON.parse(content), operatorWallets })
            }

          }

          return { data: programs }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to fetch programs" }
        }
      },
    })
  }),
  overrideExisting: false
})

export const {
  useListProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation
} = programApi