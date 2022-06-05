// import { ethers } from "ethers"
import { api } from "."
import { global } from "../../global"


export interface Program {
  /**
   * The on-chain unique program ID
   */
  id?: string;
  /**
   * The name of the program, this can be update
   */
  name: string;
  /**
   * Addresses of wallets that will have admin privileges to operate the Grant program
   */
  operatorWallets: Array<string>;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Contract ABI for the ProgramFactory in the Human-Readable format */
const CONTRACT_ABI = [
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event ProgramContractUpdated(address programContractAddress)",
  "event ProgramCreated(address programContractAddress)",
  "function create(tuple(uint256 protocol, string pointer) _metaPtr, address[] _programOperators) returns (address)",
  "function owner() view returns (address)",
  "function programContract() view returns (address)",
  "function renounceOwnership()",
  "function transferOwnership(address newOwner)",
  "function updateProgramContract(address _programContract)"
]

export const programApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProgram: builder.mutation<string, Program>({
      queryFn: async (program) => {
        try {
          let res = "TODO"
          console.log(global.web3Provider)
          await sleep(5000)

          return { data: res }

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
    getProgram: builder.query<Program, string>({
      queryFn: async (id) => {
        try {
          let res = {
            name: "TODO",
            operatorWallets: []
          }

          return { data: res }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to fetch program" }
        }
      },
    }),
    listPrograms: builder.query<Program[], void>({
      queryFn: async () => {
        try {
          let res = [{
            name: "TODO",
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
  useGetProgramQuery,
  useListProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation
} = programApi