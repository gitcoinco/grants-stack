import {
  ChainId,
} from "../types";
import {
  fetchRoundMetadata,
  getChainVerbose,
  handleResponse,
} from "../utils";
import {Request, Response} from "express";
import {
  fetchQFContributionsForProjects,
  summarizeQFContributions
} from "../votingStrategies/linearQuadraticFunding";
import {PrismaClient, VotingStrategy} from "@prisma/client";
import {hotfixForRounds} from "../hotfixes";
import {cache} from "../middleware/cacheMiddleware";

const prisma = new PrismaClient();

let updatedAt: Date;

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
    return handleResponse(res, 400, "error: missing parameter chainId, roundId, or projectId");
  }

  try {
    // Initialize round if it doesn't exist
    const metadata = await fetchRoundMetadata(chainId as ChainId, roundId);
    const {votingStrategy} = metadata;

    const votingStrategyName = votingStrategy.strategyName as VotingStrategy;

    // throw error if voting strategy is not supported
    if (votingStrategyName !== VotingStrategy.LINEAR_QUADRATIC_FUNDING) {
      throw "error: unsupported voting strategy";
    }

    const chainIdVerbose = getChainVerbose(chainId);
    const round = await prisma.round.upsert({
      where: {
        roundId: roundId,
      },
      update: {
        chainId: chainIdVerbose,
      },
      create: {
        chainId: chainIdVerbose,
        roundId,
        votingStrategyName: votingStrategyName,
      },
    });

    // Initialize project if it doesn't exist
    const project = await prisma.project.upsert({
      where: {
        roundId: roundId,
      },
      update: {
        projectId,
      },
      create: {
        roundId: roundId,
        chainId: chainIdVerbose,
        projectId: projectId,
      }
    });

    const results = await getProjectsSummary(chainId as ChainId, roundId, [projectId], req);

    // upload to project summary to db
    const projectSummary = await prisma.projectSummary.upsert({
      where: {
        projectId: projectId,
      },
      update: {
        contributionCount: results.contributionCount,
        uniqueContributors: results.uniqueContributors,
        totalContributionsInUSD: Number(results.totalContributionsInUSD),
        averageUSDContribution: Number(results.averageUSDContribution),
      },
      create: {
        contributionCount: results.contributionCount,
        uniqueContributors: results.uniqueContributors,
        totalContributionsInUSD: Number(results.totalContributionsInUSD),
        averageUSDContribution: Number(results.averageUSDContribution),
        projectId: projectId,
      }
    });

    updatedAt = projectSummary.updatedAt;

    return handleResponse(res, 200, `${req.originalUrl}`, {...results, updatedAt});
  } catch (err) {
    return handleResponse(res, 500, "error: something went wrong", err);
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
export const getProjectsSummary = async (chainId: ChainId, roundId: string, projectIds: string[], req: Request): Promise<any> => {
  let results: any = [];

  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  let {id: votingStrategyId, strategyName} = metadata.votingStrategy;

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch votes
      let contributions = await fetchQFContributionsForProjects(chainId, votingStrategyId, projectIds);

      contributions = await hotfixForRounds(roundId, contributions, projectIds);

      // fetch round stats
      results = await summarizeQFContributions(chainId, contributions);
      updatedAt = new Date();
      // cache results
      for (const projectId of projectIds) {
        cache.set(`cache_${req.originalUrl}`, {...results, updatedAt});
      }
      break;
    default:
      throw("error: unsupported voting strategy");
  }

  return results;
}