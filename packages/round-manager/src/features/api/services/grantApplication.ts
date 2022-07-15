import { api } from ".."
// import { GrantApplication } from "../types"
import { graphql_fetch } from "../utils"


/**
 * Contract interactions API for a Grant Application
 */
export const grantApplicationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listGrantApplications: builder.query<
      object[],
      { roundId: string, status: "PENDING" | "APPROVED" | "REJECTED" }
    >({
      queryFn: async ({ roundId, status }) => {
        try {
          // query the subgraph for all rounds by the given account in the given program
          const res = await graphql_fetch(
            `
              query GetGrantApplications($roundId: String!, $status: String!) {
                roundProjects(where: {
                  round: $roundId
                  status: $status
                }) {
                  id
                  metaPtr {
                    protocol
                    pointer
                  }
                  payoutAddress
                }
              }
            `,
            { roundId, status }
          )

          const grantApplications: object[] = []

          for (const project of res.data.roundProjects) {
            // const metadata = await fetchFromIPFS(project.metaPtr.pointer)

            // TODO: define a GrantApplication type in ../types to be used here
            grantApplications.push({
              id: project.id,
            })
          }

          return { data: grantApplications }

        } catch (err) {
          console.log("error", err)
          return { error: "Unable to fetch grant applications" }
        }
      }
    }),
  }),
  overrideExisting: false
})

export const {
  useListGrantApplicationsQuery,
} = grantApplicationApi