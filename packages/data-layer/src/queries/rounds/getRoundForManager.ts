import { gql } from "graphql-request";
import { generateRoundManagerFieldsForQuery } from "./generateRoundManagerFieldsForQuery";

export const getRoundForManager = gql`
  query getRoundForManager($roundId: String!, $chainId: Int!) {
    rounds(
      first: 1
      filter: {
        id: { equalTo: $roundId },
        chainId: { equalTo: $chainId },
        roundMetadata: { isNull: false }
      }
    ) {
      ${generateRoundManagerFieldsForQuery}
    }
  }
`;
