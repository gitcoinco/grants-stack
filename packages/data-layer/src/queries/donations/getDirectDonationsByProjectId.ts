import { gql } from "graphql-request";

// 0x4cd0051913234cdd7d165b208851240d334786d6e5afbb4d0eec203515a9c6f3 == DirectDonationsStrategy Id
export const getDirectDonationsByProjectId = gql`
  query getDirectDonationsByProjectId($projectId: String!, $chainIds: [Int!]!) {
    rounds(
      filter: {
        strategyId: {
          equalTo: "0x4cd0051913234cdd7d165b208851240d334786d6e5afbb4d0eec203515a9c6f3"
        }
        chainId: { in: $chainIds }
      }
    ) {
      donations(filter: { projectId: { equalTo: $projectId } }) {
        id
        amount
        donorAddress
        amountInUsd
      }
    }
  }
`;
