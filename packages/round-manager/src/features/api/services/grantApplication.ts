import { ethers } from "ethers"

import { api } from ".."
// import { GrantApplication } from "../types"
import { fetchFromIPFS, graphql_fetch } from "../utils"


/**
 * Contract interactions API for a Grant Application
 */
export const grantApplicationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listGrantApplications: builder.query<object[], { roundId: string, status: string }>({
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
                  metaPtr {
                    protocol
                    pointer
                  }
                }
              }
            `,
            { roundId, status }
          )

          const rounds: object[] = []

          for (const project of res.data.roundProjects) {
            const metadata = await fetchFromIPFS(project.metaPtr.pointer)

            // TODO: define a GrantApplication type in ../types to be used here
            rounds.push({
              ...metadata,
            })
          }

          return { data: rounds }

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