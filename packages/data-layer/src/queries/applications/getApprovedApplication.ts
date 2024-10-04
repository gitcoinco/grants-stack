import { gql } from "graphql-request";

export const getApprovedApplication = gql`
  query Application(
    $chainId: Int!
    $applicationId: String!
    $roundId: String!
  ) {
    applications(
      first: 1
      condition: {
        status: APPROVED
        chainId: $chainId
        id: $applicationId
        roundId: $roundId
      }
    ) {
      id
      chainId
      roundId
      projectId
      status
      totalAmountDonatedInUsd
      uniqueDonorsCount
      totalDonationsCount
      anchorAddress
      round {
        strategyName
        donationsStartTime
        donationsEndTime
        applicationsStartTime
        applicationsEndTime
        matchTokenAddress
        roundMetadata
      }
      metadata
      project: canonicalProject {
        tags
        id
        metadata
        anchorAddress
      }
    }
  }
`;
