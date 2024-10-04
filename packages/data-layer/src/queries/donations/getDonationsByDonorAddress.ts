import { gql } from "graphql-request";

export const getDonationsByDonorAddress = gql`
  query getDonationsByDonorAddress($address: String!, $chainIds: [Int!]!) {
    donations(
      first: 1000
      filter: {
        chainId: { in: $chainIds }
        donorAddress: { equalTo: $address }
      }
    ) {
      id
      chainId
      projectId
      roundId
      recipientAddress
      applicationId
      tokenAddress
      donorAddress
      amount
      amountInUsd
      transactionHash
      blockNumber
      timestamp
      round {
        roundMetadata
        donationsStartTime
        donationsEndTime
        strategyName
      }
      application {
        project: canonicalProject {
          name
        }
      }
    }
  }
`;
