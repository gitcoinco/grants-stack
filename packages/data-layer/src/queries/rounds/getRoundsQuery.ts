import { gql } from "graphql-request";

export const getRoundsQuery = gql`
  query GetRounds(
    $first: Int
    $orderBy: [RoundsOrderBy!]
    $filter: RoundFilter
  ) {
    rounds(first: $first, orderBy: $orderBy, filter: $filter) {
      id
      chainId
      tags
      roundMetadata
      roundMetadataCid
      applicationsStartTime
      applicationsEndTime
      donationsStartTime
      donationsEndTime
      matchAmountInUsd
      matchAmount
      matchTokenAddress
      strategyId
      strategyName
      strategyAddress
      applications(first: 1000, filter: { status: { equalTo: APPROVED } }) {
        id
      }
    }
  }
`;
