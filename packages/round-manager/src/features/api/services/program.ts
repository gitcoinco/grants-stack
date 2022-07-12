import { ethers } from "ethers"
import { api } from ".."
import { global } from "../../../global"
import { programFactoryContract, programImplementationContract } from "../contracts"
import { Program } from "../types"
import { fetchFromIPFS } from "../utils"


/**
 * Contract interations API for a Grant Program
 */
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

          operatorWallets = operatorWallets.filter(e => e !== "")

          // encode input parameters
          const encodedParamaters = ethers.utils.defaultAbiCoder.encode(
            ["tuple(uint256 protocol, string pointer)", "address[]", "address[]"],
            [
              metadata,
              operatorWallets.slice(0, 1),
              operatorWallets
            ]
          )

          // Deploy a new Program contract
          let tx = await programFactory.create(encodedParamaters)

          const receipt = await tx.wait() // wait for transaction receipt

          let programAddress

          if (receipt.events) {
            const event = receipt.events.find(
              (e: { event: string }) => e.event === 'ProgramCreated'
            )
            if (event && event.args) {
              programAddress = event.args.programContractAddress
            }
          }

          console.log("✅ Transaction hash: ", tx.hash)
          console.log("✅ Program address: ", programAddress)

          return { data: tx.hash }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to create program" }
        }
      },
      invalidatesTags: ["Program"]
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
            if (!event.args) {
              continue
            }

            const programImplementation = new ethers.Contract(
              event.args[0],
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

              // Fetch program data from contract
              const [
                metaPointer,
                operatorCount
              ] = await Promise.all([
                programImplementation.metaPtr(),
                programImplementation.getRoleMemberCount(PROGRAM_OPERATOR_ROLE)
              ])

              let operatorWallets = [];
              for (let i = 0; i < operatorCount; ++i) {
                operatorWallets.push(programImplementation.getRoleMember(PROGRAM_OPERATOR_ROLE, i))
              }
              operatorWallets = await Promise.all(operatorWallets)

              // Fetch metadata from IPFS
              const metadata = await fetchFromIPFS(metaPointer[1])

              // Add program to response
              programs.push({
                id: event.args[0],
                metadata,
                operatorWallets
              })
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
  useUpdateProgramMutation
} = programApi