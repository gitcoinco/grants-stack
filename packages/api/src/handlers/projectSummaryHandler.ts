import {
  ChainId,
} from "../types";
import {
  fetchRoundMetadata,
  getStrategyName,
  handleResponse,
} from "../utils";
import { Request, Response } from "express";
import {
  fetchQFContributionsForProject,
  summarizeQFContributions
} from "../votingStrategies/linearQuadraticFunding";

/**
 * projectSummaryHandler is a function that handles HTTP requests
 * for summary information for a given round and project.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response that will be sent.
 * @returns {void}
 */
export const projectSummaryHandler = async (req: Request, res: Response) => {
  const {chainId, roundId, projectId} = req.params;

  if (!chainId || !roundId || !projectId) {
    handleResponse(res, 400, "error: missing parameter chainId, roundId, or projectId");
  }

  try {
    const results = await getProjectsSummary(chainId as ChainId, roundId, [projectId]);

    return handleResponse(res, 200, "fetched project summary successfully", results);
  } catch (err) {
    return handleResponse(res, 500, "error: something went wrong");
  }
};

/**
 * getProjectsSummary is a function that fetches metadata and summary information for a given round and set of projects from a GraphQL API.
 *
 * @param {ChainId} chainId - The ID of the chain to fetch data from.
 * @param {string} roundId - The ID of the round to fetch data for.
 * @param {string[]} projectIds - An array of project IDs to filter the summary data by.
 * @returns {Promise<any>} A promise that resolves to an array of objects containing the summary data.
 */
export const getProjectsSummary = async (chainId: ChainId, roundId: string, projectIds: string[]): Promise<any> => {
  let results: any = [];

  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

  strategyName = getStrategyName(strategyName);

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch votes
      const contributions = await fetchQFContributionsForProject(chainId, votingStrategyId, projectIds);
      // fetch round stats
      results =  await summarizeQFContributions(chainId, contributions);
      break;
    default:
      throw("error: unsupported voting strategy");
  }

  return results;
}