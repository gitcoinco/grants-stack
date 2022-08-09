import { ethers } from "ethers"
import { api } from ".."
import { roundImplementationContract } from "../contracts"
import { GrantApplication, MetadataPointer } from "../types"
import { checkGrantApplicationStatus, fetchFromIPFS, graphql_fetch, pinToIPFS } from "../utils"


/**
 * Contract interactions API for a Grant Application
 */
export const grantApplicationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listGrantApplications: builder.query<
      GrantApplication[],
      { roundId: string, signerOrProvider: any, id?: string, status?: "PENDING" | "APPROVED" | "REJECTED" }
    >({
      queryFn: async ({ roundId, signerOrProvider, id, status }) => {
        try {
          // fetch chain id
          const { chainId } = await signerOrProvider.getNetwork()

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
                  status
                  round {
                    projectsMetaPtr {
                      protocol
                      pointer
                    }
                  }
                }
              }
            `,
            chainId,
            { roundId, id, status }
          )

          const grantApplications: GrantApplication[] = []

          for (const project of res.data.roundProjects) {
            const metadata = await fetchFromIPFS(project.metaPtr.pointer)

            let status = project.status

            if (id) {
              status = await checkGrantApplicationStatus(project.id, project.round.projectsMetaPtr)
            }

            grantApplications.push({
              ...metadata,
              status,
              id: project.id,
              projectsMetaPtr: project.round.projectsMetaPtr,
            })
          }

          return { data: grantApplications }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to fetch grant applications" }
        }
      },
      providesTags: ["GrantApplication"]
    }),
    updateGrantApplication: builder.mutation<
      string,
      {
        id: string,
        roundId: string,
        status: "APPROVED" | "REJECTED",
        projectsMetaPtr: MetadataPointer,
        payoutAddress: string,
        signerOrProvider: any
      }
    >({
      queryFn: async ({ id, roundId, status, projectsMetaPtr, payoutAddress, signerOrProvider }) => {
        try {
          let reviewedApplications: any = []
          let foundEntry = false

          // read data from ipfs
          if (projectsMetaPtr) {
            reviewedApplications = await fetchFromIPFS(projectsMetaPtr.pointer)

            // if grant application is already reviewed overwrite the entry
            foundEntry = reviewedApplications.find((o: any, i: any) => {
              if (o.id === id) {
                reviewedApplications[i] = { id, status, payoutAddress }
                return true // stop searching
              }
              return false
            })
          }

          // create a new reviewed application entry
          if (!foundEntry || !projectsMetaPtr) {
            reviewedApplications.push({ id, status, payoutAddress })
          }

          // pin new list IPFS
          const resp = await pinToIPFS({
            content: reviewedApplications,
            metadata: {
              name: "reviewed-applications"
            }
          })
          console.log("✅  Saved data to IPFS:", resp.IpfsHash)

          // update projects meta pointer in round implementation contract
          projectsMetaPtr = {
            protocol: 1,
            pointer: resp.IpfsHash
          }

          const roundImplementation = new ethers.Contract(
            roundId,
            roundImplementationContract.abi,
            signerOrProvider
          )

          let tx = await roundImplementation.updateProjectsMetaPtr(projectsMetaPtr)

          await tx.wait() // wait for transaction receipt

          console.log("✅ Transaction hash: ", tx.hash)

          return { data: tx.hash }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to update grant application" }
        }
      },
      invalidatesTags: ["GrantApplication", "Round"]
    }),
  }),
  overrideExisting: false
})

export const {
  useListGrantApplicationsQuery,
  useUpdateGrantApplicationMutation
} = grantApplicationApi
