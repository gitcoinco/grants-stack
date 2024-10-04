import { gql } from "graphql-request";

/**
 * Get a project by its ID and chainId
 * @param $projectId - The ID of the project
 * @param $chainId - The chainId
 *
 * @returns The project
 */
export const getProjectAnchorByIdAndChainId = gql`
  query ($projectId: String!, $chainId: Int!) {
    project(id: $projectId, chainId: $chainId) {
      anchorAddress
    }
  }
`;
