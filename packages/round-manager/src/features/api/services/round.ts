import { ethers } from "ethers";

import { api } from "..";
import { roundFactoryContract } from "../contracts";
import { Round } from "../types";
import { fetchFromIPFS, graphql_fetch } from "../utils";

/**
 * Contract interactions API for a Round
 */
export const roundApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRound: builder.mutation<
      string,
      { round: Round; signerOrProvider: any }
    >({
      queryFn: async ({ round, signerOrProvider }) => {
        try {
          // fetch chain id
          const chainId = await signerOrProvider.getChainId();

          // load round factory contract
          const _roundFactoryContract = roundFactoryContract(chainId);
          const roundFactory = new ethers.Contract(
            _roundFactoryContract.address!,
            _roundFactoryContract.abi,
            signerOrProvider
          );

          if (!round.applicationsEndTime) {
            round.applicationsEndTime = round.roundStartTime;
          }

          round.operatorWallets = round.operatorWallets!.filter(
            (e) => e !== ""
          );

          // encode input parameters
          const params = [
            round.votingStrategy,
            new Date(round.applicationsStartTime).getTime() / 1000,
            new Date(round.applicationsEndTime).getTime() / 1000,
            new Date(round.roundStartTime).getTime() / 1000,
            new Date(round.roundEndTime).getTime() / 1000,
            round.token,
            round.store,
            round.applicationStore,
            round.operatorWallets.slice(0, 1),
            round.operatorWallets,
          ];

          const encodedParamaters = ethers.utils.defaultAbiCoder.encode(
            [
              "address",
              "uint256",
              "uint256",
              "uint256",
              "uint256",
              "address",
              "tuple(uint256 protocol, string pointer)",
              "tuple(uint256 protocol, string pointer)",
              "address[]",
              "address[]",
            ],
            params
          );

          // Deploy a new Round contract
          const tx = await roundFactory.create(
            encodedParamaters,
            round.ownedBy
          );

          const receipt = await tx.wait(); // wait for transaction receipt

          let roundAddress;

          if (receipt.events) {
            const event = receipt.events.find(
              (e: { event: string }) => e.event === "RoundCreated"
            );
            if (event && event.args) {
              roundAddress = event.args.roundAddress;
            }
          }

          console.log("✅ Transaction hash: ", tx.hash);
          console.log("✅ Round address: ", roundAddress);

          return { data: tx.hash };
        } catch (err) {
          console.log("error", err);
          return { error: "Unable to create round" };
        }
      },
      invalidatesTags: ["Round"],
    }),
    updateRound: builder.mutation<string, Round>({
      queryFn: async ({ id, ...round }) => {
        try {
          const res = "TODO";

          return { data: res };
        } catch (err) {
          console.log("error", err);
          return { error: "Unable to update round" };
        }
      },
      invalidatesTags: ["Round"],
    }),
    listRounds: builder.query<
      Round[],
      {
        address?: string;
        signerOrProvider: any;
        programId?: string;
        roundId?: string;
      }
    >({
      queryFn: async ({ address, signerOrProvider, programId, roundId }) => {
        try {
          // fetch chain id
          const { chainId } = await signerOrProvider.getNetwork();

          // query the subgraph for all rounds by the given address in the given program
          const res = await graphql_fetch(
            `
              query GetRounds($address: String, $programId: String, $roundId: String) {
                rounds(where: {
            ` +
              (address ? `accounts_: { address: $address } ` : ``) +
              (programId ? `program: $programId` : ``) +
              (roundId ? `id: $roundId` : ``) +
              `
                }) {
                  id
                  program {
                    id
                  }
                  roundMetaPtr {
                    protocol
                    pointer
                  }
                  applicationMetaPtr {
                    protocol
                    pointer
                  }
                  applicationsStartTime
                  applicationsEndTime
                  roundStartTime
                  roundEndTime
                  roles(where: {
                    role: "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5"
                  }) {
                    accounts {
                      address
                    }
                  }
                }
              }
            `,
            chainId,
            { address: address?.toLowerCase(), programId, roundId }
          );

          const rounds: Round[] = [];

          for (const round of res.data.rounds) {
            // fetch round and application metadata from IPFS
            const [roundMetadata, applicationMetadata] = await Promise.all([
              fetchFromIPFS(round.roundMetaPtr.pointer),
              fetchFromIPFS(round.applicationMetaPtr.pointer),
            ]);

            const operatorWallets = round.roles[0].accounts.map(
              (account: any) => account.address
            );

            rounds.push({
              id: round.id,
              roundMetadata,
              applicationMetadata,
              applicationsStartTime: new Date(
                round.applicationsStartTime * 1000
              ),
              applicationsEndTime: new Date(round.applicationsEndTime * 1000),
              roundStartTime: new Date(round.roundStartTime * 1000),
              roundEndTime: new Date(round.roundEndTime * 1000),
              token: round.token,
              votingStrategy: round.votingStrategy,
              ownedBy: round.program.id,
              operatorWallets: operatorWallets,
            });
          }

          return { data: rounds };
        } catch (err) {
          console.log("error", err);
          return { error: "Unable to fetch rounds" };
        }
      },
      providesTags: ["Round"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListRoundsQuery,
  useCreateRoundMutation,
  useUpdateRoundMutation,
} = roundApi;
