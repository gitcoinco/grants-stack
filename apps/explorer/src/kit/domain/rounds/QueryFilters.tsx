import { RoundsQuery } from "@allo-team/kit";
import { gql, request } from "graphql-request";
import { createISOTimestamp } from "@/utils/utils";

export function activeRounds() {
  const currentTimestamp = createISOTimestamp();

  return gql`
        query ActiveRounds($lessThanOrEqualTo: Datetime = "${currentTimestamp}", $greaterThanOrEqualTo: Datetime = "${currentTimestamp}") {
        rounds(
            first: 10
            filter: {
                applicationsStartTime: {lessThanOrEqualTo: $lessThanOrEqualTo},
                applicationsEndTime: {greaterThanOrEqualTo: $greaterThanOrEqualTo}
            }
        ) 
        {
            id
            roundMetadata
            strategyName
            tags
            chainId
        }
    }`;
}

export function activeProjects() {
  return gql`
    query activeProjects {
      projects(first: 10) {
        metadata
        name
        id
        chainId
      }
    }
  `;
}
