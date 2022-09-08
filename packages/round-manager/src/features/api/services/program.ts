import { ethers } from "ethers";
import { api } from "..";
import { programFactoryContract } from "../contracts";
import { Program } from "../types";
import { fetchFromIPFS, graphql_fetch } from "../utils";

/**
 * Contract interactions API for a Grant Program
 */
export const programApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createProgram: builder.mutation<
      string,
      { program: Program; signerOrProvider: any }
    >({
      queryFn: async ({
        program: { store: metadata, operatorWallets },
        signerOrProvider,
      }) => {
        try {
          // fetch chain id
          const chainId = await signerOrProvider.getChainId();

          // load program factory contract
          const _programFactoryContract = programFactoryContract(chainId);
          const programFactory = new ethers.Contract(
            _programFactoryContract.address!,
            _programFactoryContract.abi,
            signerOrProvider
          );

          operatorWallets = operatorWallets.filter((e) => e !== "");

          // encode input parameters
          const encodedParamaters = ethers.utils.defaultAbiCoder.encode(
            [
              "tuple(uint256 protocol, string pointer)",
              "address[]",
              "address[]",
            ],
            [metadata, operatorWallets.slice(0, 1), operatorWallets]
          );

          // Deploy a new Program contract
          const tx = await programFactory.create(encodedParamaters);

          const receipt = await tx.wait(); // wait for transaction receipt

          let programAddress;

          if (receipt.events) {
            const event = receipt.events.find(
              (e: { event: string }) => e.event === "ProgramCreated"
            );
            if (event && event.args) {
              programAddress = event.args.programContractAddress;
            }
          }

          console.log("✅ Transaction hash: ", tx.hash);
          console.log("✅ Program address: ", programAddress);

          return { data: tx.hash };
        } catch (err) {
          console.log("error", err);
          return { error: "Unable to create program" };
        }
      },
      invalidatesTags: ["Program", "IPFS"],
    }),
    updateProgram: builder.mutation<string, Program>({
      queryFn: async ({ id, ...program }) => {
        try {
          const res = "TODO";

          return { data: res };
        } catch (err) {
          console.log("error", err);
          return { error: "Unable to update program" };
        }
      },
      invalidatesTags: ["Program"],
    }),
    listPrograms: builder.query<
      Program[],
      { address?: string; signerOrProvider: any; programId?: string }
    >({
      queryFn: async ({ address, signerOrProvider, programId }) => {
        try {
          // fetch chain id
          const { chainId } = await signerOrProvider.getNetwork();

          // get the subgraph for all programs owned by the given address
          const res = await graphql_fetch(
            `
              query GetPrograms($address: String, $programId: String) {
                programs(where: {
            ` +
              (address ? `accounts_: { address: $address } ` : ``) +
              (programId ? `id: $programId` : ``) +
              `
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
            chainId,
            { address: address?.toLowerCase(), programId }
          );

          const programs: Program[] = [];

          for (const program of res.data.programs) {
            const metadata = await fetchFromIPFS(program.metaPtr.pointer);

            programs.push({
              id: program.id,
              metadata,
              operatorWallets: program.roles[0].accounts.map(
                (program: any) => program.address
              ),
            });
          }

          return { data: programs };
        } catch (err) {
          console.log("error", err);
          return { error: "Unable to fetch programs" };
        }
      },
      providesTags: ["Program", "IPFS"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
} = programApi;
