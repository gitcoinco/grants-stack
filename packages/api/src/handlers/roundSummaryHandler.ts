import {
  ChainId,
  QFContributionSummary,
} from "../types";
import {
  fetchRoundMetadata, getChainVerbose,
  getStrategyName,
  handleResponse,
} from "../utils";
import { Request, Response } from "express";
import {
  fetchQFContributionsForRound,
  summarizeQFContributions
} from "../votingStrategies/linearQuadraticFunding";
import { PrismaClient, VotingStrategy } from "@prisma/client";
import NodeCache from "node-cache";

const prisma = new PrismaClient();

// Schedule cache invalidation every 10 minutes
const cache = new NodeCache({stdTTL: 60 * 10, checkperiod: 60 * 10});

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

  // Load from internal cache if available
  const summaryFromCache = cache.get(`${chainId}-${roundId}`);
  if (summaryFromCache) {
    return handleResponse(res, 200, "round summary (cache)", summaryFromCache);
  }

  try {
    // Initialize round if it doesn't exist
    const metadata = await fetchRoundMetadata(chainId as ChainId, roundId);
    const { votingStrategy } = metadata;
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

    const results = await getRoundSummary(chainId as ChainId, roundId);

    // upload summary to db
    await prisma.summary.upsert({
      where: {
          roundId: round.id,
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
        roundId: round.id,
      }
    });

    return handleResponse(
      res,
      200,
      "round summary",
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
      // fetch contributions
      const contributions = await fetchQFContributionsForRound(chainId, votingStrategyId);

      // fetch round stats
      results = await summarizeQFContributions(chainId, contributions);

      break;
    default:
      throw "error: unsupported voting strategy";
  }

  // cache results
  cache.set(`${chainId}-${roundId}`, results);

  return results;
};