import { gql } from "graphql-request";

export const getApplicationsForManager = gql`
  query getApplicationsForManager($chainId: Int!, $roundId: String!) {
    applications(
      first: 1000
      filter: { roundId: { equalTo: $roundId }, chainId: { equalTo: $chainId } }
    ) {
      id
      projectId
      chainId
      roundId
      status
      metadataCid
      metadata
      distributionTransaction
      statusSnapshots
      anchorAddress
      round {
        strategyName
        strategyAddress
      }
      canonicalProject {
        roles {
          address
        }
      }
    }
  }
`;
