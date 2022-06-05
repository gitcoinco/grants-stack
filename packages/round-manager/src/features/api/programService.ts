// import { ethers } from "ethers"
import { api } from "."


declare global {
  interface Window {
    ethereum: any;
  }
}

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

export const programApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProgram: builder.mutation<string, Program>({
      queryFn: async (program) => {
        try {
          let res = "TODO"
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