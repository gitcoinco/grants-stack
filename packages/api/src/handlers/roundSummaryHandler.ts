import {
  ChainId,
  QFContributionSummary,
} from "../types";
import {
  fetchRoundMetadata,
  getChainVerbose,
  handleResponse,
} from "../utils";
import {Request, Response} from "express";
import {
  fetchQFContributionsForRound,
  summarizeQFContributions
} from "../votingStrategies/linearQuadraticFunding";
import {PrismaClient, VotingStrategy} from "@prisma/client";
import {hotfixForRounds} from "../hotfixes";
import {cache} from "../middleware/cacheMiddleware";

const prisma = new PrismaClient();

let updatedAt: Date;

/**
 * roundSummaryHandler is a function that handles HTTP requests for summary information for a given round.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response that will be sent.
 * @returns {void}
 */
export const roundSummaryHandler = async (req: Request, res: Response) => {
  const {chainId, roundId} = req.params;

  if (!chainId || !roundId) {
    return handleResponse(res, 400, "error: missing parameter chainId or roundId");
  }

  try {
    // Initialize round if it doesn't exist
    const metadata = await fetchRoundMetadata(chainId as ChainId, roundId);
    const {votingStrategy} = metadata;
    const chainIdVerbose = getChainVerbose(chainId);

    const votingStrategyName = votingStrategy.strategyName as VotingStrategy;

    // throw error if voting strategy is not supported
    if (votingStrategyName !== VotingStrategy.LINEAR_QUADRATIC_FUNDING) {
      throw "error: unsupported voting strategy";
    }

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

    const results = await getRoundSummary(chainId as ChainId, roundId, req);

    // upload summary to db
    await prisma.roundSummary.upsert({
      where: {
        roundId: roundId,
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
        roundId: roundId,
      }
    });

    updatedAt = round.updatedAt;

    return handleResponse(
      res,
      200,
      `${req.originalUrl}`,
      {...results, updatedAt}
    );
  } catch (err) {
    console.log(err);

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
  roundId: string,
  req: Request,
): Promise<QFContributionSummary> => {
  let results;

  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  let {id: votingStrategyId, strategyName} = metadata.votingStrategy;

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch contributions
      let contributions = await fetchQFContributionsForRound(chainId, votingStrategyId);

      contributions = await hotfixForRounds(roundId, contributions);

      // fetch round stats
      results = await summarizeQFContributions(chainId, contributions);
      // cache results
      updatedAt = new Date();

      cache.set(`cache_${req.originalUrl}`, {...results, updatedAt});
      break;
    default:
      throw "error: unsupported voting strategy";
  }

  return results;
};