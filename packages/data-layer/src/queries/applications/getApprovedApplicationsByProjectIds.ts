import { gql } from "graphql-request";

export const getApprovedApplicationsByProjectIds = gql`
  query getApprovedApplicationsByProjectIds($projectIds: [String!]!) {
    applications(
      first: 1000
      filter: { projectId: { in: $projectIds }, status: { equalTo: APPROVED } }
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
        project {
          name
        }
        strategyName
      }
    }
  }
`;
