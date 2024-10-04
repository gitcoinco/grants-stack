import { gql } from "graphql-request";

export const getPayoutsByChainIdRoundIdProjectId = gql`
  query getPayoutsByChainIdRoundIdRecipientId(
    $chainId: Int!
    $roundId: String!
    $projectId: String!
  ) {
    round(chainId: $chainId, id: $roundId) {
      id
      applications(filter: { projectId: { equalTo: $projectId } }) {
        id
        applicationsPayoutsByChainIdAndRoundIdAndApplicationId {
          id
          tokenAddress
          amount
          amountInUsd
          transactionHash
          timestamp
          sender
        }
      }
    }
  }
`;
