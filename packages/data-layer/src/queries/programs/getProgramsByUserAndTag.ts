import { gql } from "graphql-request";

/**
 * Manager: Get all the programs that a user is a part of
 * @param $address - The address of the user
 * @param $chainId - The network ID of the chain
 * @param $tag - The tag of the program
 *
 * @returns The programs
 */
export const getProgramsByUserAndTag = gql`
  query ($userAddress: String!, $chainIds: [Int!]!, $tags: [String!]!) {
    projects(
      orderBy: PRIMARY_KEY_DESC
      first: 100
      filter: {
        tags: { contains: $tags }
        chainId: { in: $chainIds }
        roles: { some: { address: { equalTo: $userAddress } } }
      }
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
      qfRounds: rounds(
        filter: {
          strategyName: {
            equalTo: "allov2.DonationVotingMerkleDistributionDirectTransferStrategy"
          }
        }
      ) {
        id
      }
      dgRounds: rounds(
        filter: { strategyName: { equalTo: "allov2.DirectGrantsLiteStrategy" } }
      ) {
        id
      }
    }
  }
`;
