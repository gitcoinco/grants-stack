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
            round.operatorWallets!.filter(e => e !== "")
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
          const filter = roundFactory.filters.GrantRoundCreated(null, programId)
          const events = await roundFactory.queryFilter(filter)

          const rounds: Round[] = []

          // Loop through past events to filter rounds for which the connected account
          // has the required operator permission
          for (const event of events) {
            const roundImplementation = new ethers.Contract(
              event.args![0],
              roundImplementationContract.abi,
              global.web3Provider
            )

            const ROUND_OPERATOR_ROLE = ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("ROUND_OPERATOR")
            )

            const isOperator = await roundImplementation.hasRole(
              ROUND_OPERATOR_ROLE, account
            )

            if (isOperator) {
              // Connected wallet is a Round Operator

              // Fetch round data from contract
              const [
                metadata,
                applicationStartTime,
                startTime,
                endTime,
                votingContract,
                token,
                // operatorCount
              ] = await Promise.all([
                roundImplementation.metaPtr(),
                roundImplementation.grantApplicationsStartTime(),
                roundImplementation.roundStartTime(),
                roundImplementation.roundEndTime(),
                roundImplementation.votingContract(),
                roundImplementation.token(),
                // roundImplementation.getRoleMemberCount(ROUND_OPERATOR_ROLE)
              ])

              // Fetch operator wallets for the round
              // let operatorWallets = [];
              // for (let i = 0; i < operatorCount; ++i) {
              //   operatorWallets.push(roundImplementation.getRoleMember(ROUND_OPERATOR_ROLE, i))
              // }
              // operatorWallets = await Promise.all(operatorWallets)

              // Fetch metadata from ipfs
              if (global.ipfs === undefined) {
                global.ipfs = await IPFSCreate()
              }

              const decoder = new TextDecoder()
              let content = ''

              for await (const chunk of global.ipfs.cat(metadata[1])) {
                content += decoder.decode(chunk)
              }

              // Add round to response
              rounds.push({
                id: event.args![0],
                metadata: JSON.parse(content),
                applicationStartTime: new Date(applicationStartTime.toNumber() * 1000),
                startTime: new Date(startTime.toNumber() * 1000),
                endTime: new Date(endTime.toNumber() * 1000),
                votingContract,
                token,
                ownedBy: event.args![1],
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