import { gql } from "graphql-request";

export const getBlockNumberQuery = gql`
  query getBlockNumberQuery($chainId: Int!) {
    {
      subscriptions(
        first: 1000
        filter: { chainId: { equalTo: $chainId }, toBlock: { equalTo: "latest" } }
      ) {
        chainId
        indexedToBlock
      }
    }
  }
`;
