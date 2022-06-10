import { ethers } from "ethers"
import { create as IPFSCreate } from "ipfs-core"
import { api } from ".."
import { global } from "../../../global"
import { roundFactoryContract, roundImplementationContract } from "../contracts"
import { Round } from "../types"


/**
 * Contract interations API for a Grant Round
 */
export const roundApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRound: builder.mutation<string, Round>({
      queryFn: async (round) => {
        try {
          const roundFactory = new ethers.Contract(
            roundFactoryContract.address!,
            roundFactoryContract.abi,
            global.web3Signer
          )

          // Deploy a new Round contract
          let tx = await roundFactory.create(
            round.votingContract,
            Math.round(new Date(round.applicationStartTime).getTime() / 1000),
            Math.round(new Date(round.startTime).getTime() / 1000),
            Math.round(new Date(round.endTime).getTime() / 1000),
            round.token,
            round.ownedBy,
            round.store,
            round.operatorWallets.filter(e => e !== "")
          )

          await tx.wait() // wait for transaction receipt

          console.log("Deployed round contract:", tx.hash)

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
    listRounds: builder.query<string, string>({
      queryFn: async (account) => {
        try {
          let res = "TODO"

          return { data: "round list" }

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