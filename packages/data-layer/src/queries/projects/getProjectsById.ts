import { gql } from "graphql-request";

/**
 * Get a project by its ID
 * @param $alloVersion - The version of Allo
 * @param $projectId - The ID of the project
 *
 * @returns The project
 */
export const getProjectsById = gql`
  query ($alloVersion: [String!]!, $projectId: String!) {
    projects(
      first: 100
      filter: {
        tags: { equalTo: $alloVersion }
        not: { tags: { contains: "program" } }
        id: { equalTo: $projectId }
      }
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
      roles(first: 1000) {
        address
        role
        createdAtBlock
      }
    }
  }
`;
