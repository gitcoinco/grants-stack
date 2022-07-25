import { ethers } from "ethers"
import { api } from ".."
import { roundFactoryContract } from "../contracts"
import { GrantApplication, MetadataPointer } from "../types"
import { fetchFromIPFS, graphql_fetch } from "../utils"
import { global } from "../../../global"


/**
 * Contract interactions API for a Grant Application
 */
export const grantApplicationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listGrantApplications: builder.query<
      GrantApplication[],
      { roundId: string, id?: string, status?: "PENDING" | "APPROVED" | "REJECTED" }
    >({
      queryFn: async ({ roundId, id, status }) => {
        try {
          // query the subgraph for all rounds by the given account in the given program
          const res = await graphql_fetch(
            `
              query GetGrantApplications($roundId: String!, $id: String, $status: String) {
                roundProjects(where: {
                  round: $roundId
            `
            +
            (status ? `status: $status` : ``)
            +
            (id ? `id: $id` : ``)
            +
            `
                }) {
                  id
                  metaPtr {
                    protocol
                    pointer
                  }
                  round {
                    projectsMetaPtr {
                      protocol
                      pointer
                    }
                  }
                }
              }
            `,
            { roundId, id, status }
          )

          const grantApplications: GrantApplication[] = []

          for (const project of res.data.roundProjects) {
            const metadata = await fetchFromIPFS(project.metaPtr.pointer)
            grantApplications.push({
              ...metadata,
              id: project.id,
              projectsMetaPtr: project.round.projectsMetaPtr
            })
          }

          return { data: grantApplications }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to fetch grant applications" }
        }
      }
    }),
    updateGrantApplication: builder.mutation<
      string,
      {
        id: string,
        status: "APPROVED" | "REJECTED" | "APPEAL" | "FRAUD",
        projectsMetaPtr: MetadataPointer,
        payoutAddress: string
      }
    >({
      queryFn: async ({ id, status, projectsMetaPtr, payoutAddress }) => {
        try {
          // read data from ipfs
          const reviewedApplications = await fetchFromIPFS(projectsMetaPtr.pointer)

          // if grant application is already reviewed overwrite the information
          const obj = reviewedApplications.find((o: any, i: any) => {
            if (o.id === id) {
              reviewedApplications[i] = { id, status, payoutAddress }
              return true // stop searching
            }
            return false
          })

          // create a new reviewed application entry
          if (!obj) {
            reviewedApplications.push({ id, status, payoutAddress })
          }

          const roundFactory = new ethers.Contract(
            roundFactoryContract.address!,
            roundFactoryContract.abi,
            global.web3Signer
          )

          // update projects meta pointer in round implementation contract
          let tx = await roundFactory.updateProjectsMetaPtr(projectsMetaPtr)

          const receipt = await tx.wait() // wait for transaction receipt

          // read projects updated event
          let newProjectsMetaPtr

          if (receipt.events) {
            const event = receipt.events.find(
              (e: { event: string }) => e.event === "ProjectsMetaPtrUpdated"
            )
            if (event && event.args) {
              newProjectsMetaPtr = event.args.newMetaPtr
            }
          }

          console.log("✅ Transaction hash: ", tx.hash)
          console.log("✅ New projects meta pointer: ", newProjectsMetaPtr)

          return { data: tx.hash }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to update grant application" }
        }
      },
      invalidatesTags: ["GrantApplication"]
    }),
  }),
  overrideExisting: false
})

export const {
  useListGrantApplicationsQuery,
  useUpdateGrantApplicationMutation
} = grantApplicationApi