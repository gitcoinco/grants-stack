import { gql } from "graphql-request";
import { generateRoundManagerFieldsForQuery } from "./generateRoundManagerFieldsForQuery";

export const getRoundsForManager = gql`
  query getRoundsForManager($chainId: Int!, $programId: String!) {
    rounds(
      orderBy: ID_DESC
      first: 1000
      filter: {
        chainId: { equalTo: $chainId }
        projectId: { equalTo: $programId }
        roundMetadata: { isNull: false }
      }
    ) {
      ${generateRoundManagerFieldsForQuery}
    }
  }
`;
