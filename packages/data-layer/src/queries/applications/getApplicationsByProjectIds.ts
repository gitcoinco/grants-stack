import { gql } from "graphql-request";

export const getApplicationsByProjectIds = gql`
  query getApplicationsByProjectIds(
    $projectIds: [String!]!
    $chainIds: [Int!]!
  ) {
    applications(
      first: 1000
      filter: { projectId: { in: $projectIds }, chainId: { in: $chainIds } }
    ) {
      id
      projectId
      chainId
      roundId
      status
      metadataCid
      metadata
      totalDonationsCount
      totalAmountDonatedInUsd
      uniqueDonorsCount
      round {
        applicationsStartTime
        applicationsEndTime
        donationsStartTime
        donationsEndTime
        roundMetadata
        strategyName
      }
    }
  }
`;
