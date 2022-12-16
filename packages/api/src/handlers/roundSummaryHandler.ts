import {
  ChainId,
  QFContributionSummary,
  QFVote,
} from "../types";
import {
  fetchRoundMetadata,
  getStrategyName,
  groupBy,
  handleResponse,
} from "../utils";
import { Request, Response } from "express";
import {
  fetchQFContributionsForRound,
  summarizeQFContributions
} from "../votingStrategies/linearQuadraticFunding";

/**
 * roundSummaryHandler is a function that handles HTTP requests for summary information for a given round.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response that will be sent.
 * @returns {void}
 */
export const roundSummaryHandler = async (req: Request, res: Response) => {
  const { chainId, roundId } = req.params;

  if (!chainId || !roundId) {
    return handleResponse(res, 400, "error: missing parameter chainId or roundId");
  }

  try {
    const results = await getRoundSummary(chainId as ChainId, roundId);

    return handleResponse(
      res,
      200,
      "fetched round summary successfully",
      results
    );
  } catch (err) {
    return handleResponse(res, 500, "error: something went wrong", err);
  }
};

/**
 * getRoundSummary is a function that fetches metadata and summary information for a given round from a GraphQL API.
 *
 * @param {ChainId} chainId - The ID of the chain to fetch data from.
 * @param {string} roundId - The ID of the round to fetch data for.
 * @returns {Promise<QFContributionSummary>} A promise that resolves to an object containing the summary data for the round.
 */
export const getRoundSummary = async (
  chainId: ChainId,
  roundId: string
): Promise<QFContributionSummary> => {
  let results;
  
  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

  strategyName = getStrategyName(strategyName);

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch contributtions
      const contributions = await fetchQFContributionsForRound(chainId, votingStrategyId);

      // fetch round stats
      results = await summarizeQFContributions(chainId, contributions);

      // fetch projects in round stats
      // const projectsSummary = await fetchProjectSummary(chainId, contributions);
      // console.log(projectsSummary);
      // results.projects = projectsSummary;

      break;
    default:
      throw "error: unsupported voting strategy";
  }

  return results;
};


const fetchProjectSummary = async ( chainId: ChainId, contributions: QFVote[]) => {
  let projectsSummary: any = {};
  const groupContributionsByProject = groupBy(contributions, (contribution: QFVote) => contribution.projectId);
  
  if(groupContributionsByProject.size == 0) {
    return projectsSummary;
  }

  groupContributionsByProject.forEach(async contributionsForProject => {    
    const projectSummary = await summarizeQFContributions(chainId, contributionsForProject);
    const projectId = contributionsForProject[0].projectId;

    projectsSummary[projectId] = projectSummary;
    
    projectsSummary[projectId] = projectSummary;
    console.log(projectId, projectSummary);
  });

  return projectsSummary;

}