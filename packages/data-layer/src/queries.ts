import { gql } from "graphql-request";

/**
 * Get a project by its ID
 * @param $alloVersion - The version of Allo
 * @param $projectId - The ID of the project
 * @param $chainId - The network ID of the chain
 * 
 * @returns The project
 */
export const getProjectById = gql`
  query ($alloVersion: [String!]!, $projectId: String!, $chainId: Int!) {
    projects(
      filter: {
        tags: { equalTo: $alloVersion }
        id: { equalTo: $projectId }
        and: { chainId: { equalTo: $chainId } }
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
    }
  }
`;

/**
 * Get projects by their address
 * @param $alloVersion - The version of Allo
 * @param $first - The number of projects to return
 * @param $chainId - The network ID of the chain
 * 
 * @returns The project[]
 */
export const getProjects = gql`
  query getProjectsQuery(
    $alloVersion: [String!]!
    $first: Int!
    $chainId: Int!
  ) {
    projects(
      filter: { tags: { equalTo: $alloVersion } }
      first: $first
      condition: { chainId: $chainId }
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
    }
  }
`;

/**
 * Get projects by their address
 * @param $address - The address of the project
 * @param $chainId - The network ID of the chain
 * @param $role - The role of the project
 * 
 * @returns The project[]
 */
export const getProjectsByAddress = gql`
  query getProjectsByAddressQuery(
    $address: String!
    $chainId: Int!
    $role: ProjectRoleName!
  ) {
    projectRoles(
      condition: { address: $address, chainId: $chainId, role: $role }
    ) {
      projectId
      project {
        chainId
        createdAtBlock
        registryAddress
        projectNumber
        tags
      }
    }
  }
`;