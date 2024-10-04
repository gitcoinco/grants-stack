import { gql } from "graphql-request";

export const getApplicationsForExplorer = gql`
  query Applications($chainId: Int!, $roundId: String!) {
    applications(
      first: 1000
      condition: { chainId: $chainId, roundId: $roundId, status: APPROVED }
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
