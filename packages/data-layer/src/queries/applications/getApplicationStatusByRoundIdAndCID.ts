import { gql } from "graphql-request";

export const getApplicationStatusByRoundIdAndCID = gql`
  query getApplicationStatusByRoundIdAndCID(
    $roundId: String!
    $chainId: Int!
    $metadataCid: String!
  ) {
    applications(
      first: 1
      filter: {
        roundId: { equalTo: $roundId }
        chainId: { equalTo: $chainId }
        metadataCid: { equalTo: $metadataCid }
      }
    ) {
      status
    }
  }
`;
