import { api } from ".."
import { GrantApplication } from "../types"
import { fetchFromIPFS, graphql_fetch } from "../utils"


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
                }
              }
            `,
            { roundId, id, status }
          )

          const grantApplications: GrantApplication[] = []

          for (const project of res.data.roundProjects) {
            const metadata = await fetchFromIPFS(project.metaPtr.pointer)
            grantApplications.push({ ...metadata, id: project.id })
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