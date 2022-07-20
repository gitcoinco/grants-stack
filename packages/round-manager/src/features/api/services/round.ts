import { ethers } from "ethers"

import { api } from ".."
import { roundFactoryContract } from "../contracts"
import { Round } from "../types"
import { fetchFromIPFS, graphql_fetch } from "../utils"
import { global } from "../../../global"
import { useGetWeb3Query } from "./web3"


/**
 * Contract interactions API for a Round
 */
export const roundApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRound: builder.mutation<string, Round>({
      queryFn: async (round) => {
        try {
          // fetch chain id
          const chainId = (await useGetWeb3Query().data)?.chainId

          // load round factory contract
          const _roundFactoryContract = roundFactoryContract(chainId);
          const roundFactory = new ethers.Contract(
            _roundFactoryContract.address!,
            _roundFactoryContract.abi,
            global.web3Signer
          )

          if (!round.applicationsEndTime) {
            round.applicationsEndTime = round.roundStartTime
          }

          round.operatorWallets = round.operatorWallets!.filter(e => e !== "")

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
            round.operatorWallets
          ]

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
              "address[]"
            ],
            params
          )

          // Deploy a new Round contract
          let tx = await roundFactory.create(encodedParamaters, round.ownedBy)

          const receipt = await tx.wait() // wait for transaction receipt

          let roundAddress

          if (receipt.events) {
            const event = receipt.events.find(
              (e: { event: string }) => e.event === 'RoundCreated'
            )
            if (event && event.args) {
              roundAddress = event.args.roundAddress
            }
          }

          console.log("✅ Transaction hash: ", tx.hash)
          console.log("✅ Round address: ", roundAddress)

          return { data: tx.hash }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to create round" }
        }
      },
      invalidatesTags: ["Round"]
    }),
    updateRound: builder.mutation<string, Round>({
      queryFn: async ({ id, ...round }) => {
        try {
          let res = "TODO"

          return { data: res }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to update round" }
        }
      },
    }),
    listRounds: builder.query<Round[], { account: string, programId?: string }>({
      queryFn: async ({ account, programId }) => {
        try {
          // query the subgraph for all rounds by the given account in the given program
          const res = await graphql_fetch(
            `
              query GetRounds($account: String!, $programId: String) {
                rounds(where: {
                  accounts_: {
                    address: $account
                  }
            `
            +
            (programId ? `program: $programId` : ``)
            +
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
                }
              }
            `,
            { account, programId }
          )

          const rounds: Round[] = []

          for (const round of res.data.rounds) {
            // fetch round and application metadata from IPFS
            const [
              roundMetadata,
              applicationMetadata
            ] = await Promise.all([
              fetchFromIPFS(round.roundMetaPtr.pointer),
              fetchFromIPFS(round.applicationMetaPtr.pointer)
            ])

            rounds.push({
              id: round.id,
              roundMetadata,
              applicationMetadata,
              applicationsStartTime: new Date(round.applicationsStartTime * 1000),
              applicationsEndTime: new Date(round.applicationsEndTime * 1000),
              roundStartTime: new Date(round.roundStartTime * 1000),
              roundEndTime: new Date(round.roundEndTime * 1000),
              token: round.token,
              votingStrategy: round.votingStrategy,
              ownedBy: round.program.id
            })
          }

          return { data: rounds }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to fetch rounds" }
        }
      },
    })
  }),
  overrideExisting: false
})

export const {
  useListRoundsQuery,
  useCreateRoundMutation,
  useUpdateRoundMutation
} = roundApi