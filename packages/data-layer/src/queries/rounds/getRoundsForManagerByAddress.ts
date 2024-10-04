import { gql } from "graphql-request";
import { generateRoundManagerFieldsForQuery } from "./generateRoundManagerFieldsForQuery";

export const getRoundsForManagerByAddress = gql`
  query getRoundsForManager($chainIds: [Int!]!, $address: String!) {
    rounds(
      orderBy: ID_DESC
      first: 1000
      filter: {
        roundMetadata: { isNull: false },
        chainId: {in: $chainIds},
        roles: {
          some: {
            address: {
              equalTo: $address
            }
          }
        }
      }
    ) {
      ${generateRoundManagerFieldsForQuery}
    }
  }
`;
