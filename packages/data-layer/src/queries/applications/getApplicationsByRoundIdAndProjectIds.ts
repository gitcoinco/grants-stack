import { gql } from "graphql-request";

export const getApplicationsByRoundIdAndProjectIds = gql`
  query Application(
    $chainId: Int!
    $roundId: String!
    $projectIds: [String!]!
  ) {
    applications(
      first: 1000
      filter: {
        chainId: { equalTo: $chainId }
        roundId: { equalTo: $roundId }
        projectId: { in: $projectIds }
      }
    ) {
      id
      projectId
      chainId
      roundId
      status
      metadataCid
      metadata
      anchorAddress
      round {
        applicationsStartTime
        applicationsEndTime
        donationsStartTime
        donationsEndTime
        roundMetadata
      }
    }
  }
`;
