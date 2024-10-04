import { gql } from "graphql-request";

export const getProjectsAndRolesByAddress = gql`
  query getProjectsAndRolesByAddressQuery(
    $address: String!
    $version: [String!]!
    $chainIds: [Int!]!
  ) {
    projects(
      first: 1000
      filter: {
        roles: { every: { address: { equalTo: $address } } }
        tags: { contains: $version }
        not: { tags: { contains: "program" } }
        chainId: { in: $chainIds }
        rolesExist: true
      }
    ) {
      roles(first: 1000) {
        role
        address
        projectId
      }
      name
      registryAddress
      chainId
      metadata
      metadataCid
      projectNumber
      tags
      id
      nonce
      anchorAddress
      projectType
      createdAtBlock
      applications(first: 1000) {
        id
        metadata
      }
    }
  }
`;
