import { gql } from "graphql-request";

export const getRoundForExplorer = gql`
  query getRoundForExplorer($roundId: String!, $chainId: Int!) {
    rounds(
      first: 1
      filter: {
        id: { equalTo: $roundId }
        chainId: { equalTo: $chainId }
        roundMetadata: { isNull: false }
      }
    ) {
      id
      chainId
      uniqueDonorsCount
      applicationsStartTime
      applicationsEndTime
      donationsStartTime
      donationsEndTime
      matchTokenAddress
      roundMetadata
      roundMetadataCid
      applicationMetadata
      applicationMetadataCid
      strategyId
      projectId
      strategyAddress
      strategyName
      readyForPayoutTransaction
      applications(first: 1000, filter: { status: { equalTo: APPROVED } }) {
        id
        projectId
        status
        metadata
        anchorAddress
        project: canonicalProject {
          id
          metadata
          anchorAddress
        }
      }
    }
  }
`;
