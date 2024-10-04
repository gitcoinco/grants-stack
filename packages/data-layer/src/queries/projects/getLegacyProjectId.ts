import { gql } from "graphql-request";

/**
 * Get a getLegacyProjectId by its ID
 * @param $projectId - The Allo v2 ID of the project
 *
 * @returns The project
 */
export const getLegacyProjectId = gql`
  query ($projectId: String!) {
    legacyProjects(first: 1, filter: { v2ProjectId: { equalTo: $projectId } }) {
      v1ProjectId
    }
  }
`;
