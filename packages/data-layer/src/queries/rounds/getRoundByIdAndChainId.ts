import { gql } from "graphql-request";

export const getRoundByIdAndChainId = gql`
  query getRoundByIdAndChainId($roundId: String!, $chainId: Int!) {
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
      applicationsStartTime
      applicationsEndTime
      donationsStartTime
      donationsEndTime
      matchTokenAddress
      roundMetadata
      roundMetadataCid
      applicationMetadata
      applicationMetadataCid
      strategyAddress
      strategyName
      readyForPayoutTransaction
      projectId
      roles(first: 100) {
        role
        address
      }
      project {
        id
        name
        metadata
      }
      tags
    }
  }
`;
