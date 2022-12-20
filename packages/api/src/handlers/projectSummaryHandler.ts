import {
  ChainId,
} from "../types";
import {
  fetchRoundMetadata, getChainVerbose,
  getStrategyName,
  handleResponse,
} from "../utils";
import { Request, Response } from "express";
import {
  fetchQFContributionsForProjects,
  summarizeQFContributions
} from "../votingStrategies/linearQuadraticFunding";
import { PrismaClient, VotingStrategy } from "@prisma/client";
import NodeCache from "node-cache";

const prisma = new PrismaClient();

// Schedule cache invalidation every 10 minutes
const cache = new NodeCache({stdTTL: 60 * 10, checkperiod: 60 * 10});
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

  // check if force query is set
  const forceQuery = req.query.force === "true";

  // Load from internal cache if available
  const projectSummaryFromCache = cache.get(`${chainId}-${roundId}-${projectId}-summary`);
  if (projectSummaryFromCache && !forceQuery) {
    return handleResponse(res, 200, `project summary`, {...projectSummaryFromCache, updatedAt});
  }

  try {
    // Initialize round if it doesn't exist
    const metadata = await fetchRoundMetadata(chainId as ChainId, roundId);
    const {votingStrategy} = metadata;
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
        votingStrategyName: <VotingStrategy>votingStrategy.strategyName,
      },
    });

    // Initialize project if it doesn't exist
    const project = await prisma.project.upsert({
      where: {
        roundId: round.id,
      },
      update: {
        projectId,
      },
      create: {
        roundId: round.id,
        chainId: chainIdVerbose,
        projectId: projectId,
      }
    });

    const results = await getProjectsSummary(chainId as ChainId, roundId, [projectId]);

    // upload to project summary to db
    const projectSummary = await prisma.projectSummary.upsert({
      where: {
        projectId: project.id,
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
        projectId: project.id,
      }
    });

    updatedAt = projectSummary.updatedAt;

    return handleResponse(res, 200, `project summary`, {...results, updatedAt});
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
export const getProjectsSummary = async (chainId: ChainId, roundId: string, projectIds: string[]): Promise<any> => {
  let results: any = [];

  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  let {id: votingStrategyId, strategyName} = metadata.votingStrategy;

  strategyName = getStrategyName(strategyName);

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch votes
      const contributions = await fetchQFContributionsForProjects(chainId, votingStrategyId, projectIds);

      // fetch round stats      
      results = await summarizeQFContributions(chainId, contributions);
      updatedAt = new Date();
      // cache results
      for (const projectId of projectIds) {
        cache.set(`${chainId}-${roundId}-${projectId}-summary`, {...results, updatedAt});
      }
      break;
    default:
      throw("error: unsupported voting strategy");
  }

  return results;
}