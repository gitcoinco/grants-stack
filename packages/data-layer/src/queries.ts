import { gql } from "graphql-request";

// todo: owner address was removed, and moved to projectRoles
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