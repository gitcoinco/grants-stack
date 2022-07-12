import { ethers } from "ethers"

import { api } from ".."
import { roundFactoryContract, roundImplementationContract } from "../contracts"
import { Round } from "../types"
import { fetchFromIPFS } from "../utils"
import { global } from "../../../global"


/**
 * Contract interations API for a Round
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
          account = ethers.utils.getAddress(account)

          const roundFactory = new ethers.Contract(
            roundFactoryContract.address!,
            roundFactoryContract.abi,
            global.web3Provider
          )

          // Create event filter and query rounds created from past events
          const filter = roundFactory.filters.RoundCreated(null, programId)
          const events = await roundFactory.queryFilter(filter)

          const rounds: Round[] = []

          // Loop through past events to filter rounds for which the connected account
          // has the required operator permission
          for (const event of events) {
            if (!event.args) {
              continue
            }

            const roundImplementation = new ethers.Contract(
              event.args.roundAddress,
              roundImplementationContract.abi,
              global.web3Provider
            )

            const ROUND_OPERATOR_ROLE = await roundImplementation.ROUND_OPERATOR_ROLE()

            const isOperator = await roundImplementation.hasRole(
              ROUND_OPERATOR_ROLE, account
            )

            if (isOperator) {
              // Connected wallet is a Round Operator

              // Fetch round data from contract
              const [
                roundMetaPtr,
                applicationMetaPtr,
                applicationsStartTime,
                applicationsEndTime,
                roundStartTime,
                roundEndTime,
                votingStrategy,
                token,
                // operatorCount
              ] = await Promise.all([
                roundImplementation.roundMetaPtr(),
                roundImplementation.applicationMetaPtr(),
                roundImplementation.applicationsStartTime(),
                roundImplementation.applicationsEndTime(),
                roundImplementation.roundStartTime(),
                roundImplementation.roundEndTime(),
                roundImplementation.votingStrategy(),
                roundImplementation.token(),
                // roundImplementation.getRoleMemberCount(ROUND_OPERATOR_ROLE)
              ])

              // Fetch operator wallets for the round
              // let operatorWallets = [];
              // for (let i = 0; i < operatorCount; ++i) {
              //   operatorWallets.push(roundImplementation.getRoleMember(ROUND_OPERATOR_ROLE, i))
              // }
              // operatorWallets = await Promise.all(operatorWallets)

              // Fetch round and application metadata from IPFS
              const [
                roundMetadata,
                applicationMetadata
              ] = await Promise.all([
                fetchFromIPFS(roundMetaPtr[1]),
                fetchFromIPFS(applicationMetaPtr[1])
              ])

              // Add round to response
              rounds.push({
                id: event.args.roundAddress,
                metadata: roundMetadata,
                applicationMetadata,
                applicationsStartTime: new Date(applicationsStartTime.toNumber() * 1000),
                applicationsEndTime: new Date(applicationsEndTime.toNumber() * 1000),
                roundStartTime: new Date(roundStartTime.toNumber() * 1000),
                roundEndTime: new Date(roundEndTime.toNumber() * 1000),
                votingStrategy,
                token,
                ownedBy: event.args.ownedBy,
                // operatorWallets
              })
            }
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