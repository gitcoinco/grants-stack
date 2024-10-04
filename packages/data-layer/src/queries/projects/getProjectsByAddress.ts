import { gql } from "graphql-request";

/**
 * Get projects by their address
 * @param $address - The address of the project
 * @param $chainId - The network ID of the chain
 * @param $role - The role of the project
 *
 * @returns The project[]
 */
// todo: add version
export const getProjectsByAddress = gql`
  query getProjectsByAddressQuery(
    $address: String!
    $chainId: Int!
    $role: ProjectRoleName!
    $version: String!
  ) {
    projectRoles(
      first: 100
      condition: { address: $address, chainId: $chainId, role: $role }
    ) {
      projectId
      project {
        chainId
        createdAtBlock
        registryAddress
        projectNumber
        tags
        nonce
        anchorAddress
        projectType
      }
    }
  }
`;
