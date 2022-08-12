import { ethers } from "ethers"
import { api } from ".."
import { roundImplementationContract } from "../contracts"
import { GrantApplication } from "../types"
import { checkGrantApplicationStatus, fetchFromIPFS, graphql_fetch, pinToIPFS } from "../utils"


const updateApplication = (application: GrantApplication): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      let reviewedApplications: any = []
      let foundEntry = false

      // read data from ipfs
      if (application.projectsMetaPtr) {
        reviewedApplications = await fetchFromIPFS(application.projectsMetaPtr.pointer)

        // if grant application is already reviewed overwrite the entry
        foundEntry = reviewedApplications.find((o: any, i: any) => {
          if (o.id === application.id) {
            reviewedApplications[i] = {
              id: application.id,
              status: application.status,
              payoutAddress: application.recipient
            }
            return true // stop searching
          }
          return false
        })
      }

      // create a new reviewed application entry
      if (!foundEntry || !application.projectsMetaPtr) {
        reviewedApplications.push({
          id: application.id,
          status: application.status,
          payoutAddress: application.recipient
        })
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
      application.projectsMetaPtr = {
        protocol: 1,
        pointer: resp.IpfsHash
      }

      const roundImplementation = new ethers.Contract(
        application.round,
        roundImplementationContract.abi,
        application.signerOrProvider
      )

      let tx = await roundImplementation.updateProjectsMetaPtr(application.projectsMetaPtr)

      await tx.wait() // wait for transaction receipt

      console.log("✅ Transaction hash: ", tx.hash)

      resolve(tx.hash)
    } catch (err) {
      console.log("error", err)
      reject("Unable to update grant application")
    }
  })
}


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
      GrantApplication
    >({
      queryFn: async (application) => {
        try {
          const txHash = await updateApplication(application)

          return { data: txHash }

        } catch (err: any) {
          return { error: err.message }
        }
      },
      invalidatesTags: ["GrantApplication", "Round"]
    }),
    bulkUpdateGrantApplications: builder.mutation<
      string,
      GrantApplication[]
    >({
      queryFn: async (applications) => {
        try {
          Promise.all(
            applications.map(async application => {
              await updateApplication(application)
            })
          )
          return { data: `${applications.length} applications successfully reviewed` }
        } catch (err) {
          console.log("error", err)
          return { error: "Unable to update the grant applications" }
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
