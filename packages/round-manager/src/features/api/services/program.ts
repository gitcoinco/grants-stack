import { ethers } from "ethers"
import { api } from ".."
import { global } from "../../../global"
import { programFactoryContract } from "../contracts"
import { Program } from "../types"
import { fetchFromIPFS, getWeb3Instance, graphql_fetch } from "../utils"


/**
 * Contract interactions API for a Grant Program
 */
export const programApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProgram: builder.mutation<string, Program>({
      queryFn: async ({ store: metadata, operatorWallets }) => {
        try {
          // fetch chain id
          const chainId = (await getWeb3Instance())?.chainId

          // load program factory contract
          const _programFactoryContract = programFactoryContract(chainId);
          const programFactory = new ethers.Contract(
            _programFactoryContract.address!,
            _programFactoryContract.abi,
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
          // get the subgraph for all programs owned by the given account
          const res = await graphql_fetch(
            `
              query GetPrograms($account: String!) {
                programs(where: {
                  accounts_: {
                    address: $account
                  }
                }) {
                  id
                  metaPtr {
                    protocol
                    pointer
                  }
                  roles(where: {
                    role: "0xaa630204f2780b6f080cc77cc0e9c0a5c21e92eb0c6771e709255dd27d6de132"
                  }) {
                    accounts {
                      address
                    }
                  }
                }
              }
            `,
            { account }
          )

          const programs: Program[] = []

          for (const program of res.data.programs) {
            const metadata = await fetchFromIPFS(program.metaPtr.pointer)

            programs.push({
              id: program.id,
              metadata,
              operatorWallets: program.roles[0].accounts.map((program: any) => program.address)
            })
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