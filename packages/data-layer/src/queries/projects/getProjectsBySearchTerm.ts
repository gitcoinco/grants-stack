import { gql } from "graphql-request";

/**
 * Get projects by search term
 * @param $searchTerm - The search term
`* @param $first - The number of projects to return
 * @param $offset - The offset of the projects
 *
 * @returns The v2Projects
 */
export const getProjectsBySearchTerm = gql`
  query getProjectsBySearchTerm(
    $searchTerm: String!
    $first: Int!
    $offset: Int!
  ) {
    searchProjects(
      searchTerm: $searchTerm
      filter: {
        metadata: { isNull: false }
        tags: { equalTo: "allo-v2" }
        not: { tags: { contains: "program" } }
        chainId: {
          in: [1, 137, 10, 324, 42161, 42220, 43114, 534352, 8453, 1329]
        }
        rounds: { every: { applicationsExist: true } }
      }
      first: $first
      offset: $offset
    ) {
      id
      chainId
      metadata
      metadataCid
      name
      nodeId
      projectNumber
      registryAddress
      tags
      nonce
      anchorAddress
      projectType
    }
  }
`;
