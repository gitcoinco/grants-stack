import { gql } from "graphql-request";

/**
 * Get a program by its programId
 * @param $alloVersion - The version of Allo
 * @param $programId - The ID of the program
 * @param $chainId - The network ID of the chain
 *
 * @returns The programs
 */
export const getProgramById = gql`
  query ($programId: String!, $chainId: Int!) {
    projects(
      first: 1
      filter: { id: { equalTo: $programId }, chainId: { equalTo: $chainId } }
    ) {
      id
      chainId
      metadata
      metadataCid
      tags
      createdByAddress
      roles(first: 1000) {
        address
        role
        createdAtBlock
      }
    }
  }
`;
