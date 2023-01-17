import { Request, Response } from "express";
import { VotingStrategy } from "@prisma/client";
import { ChainId, QFContributionSummary, RoundMetadata } from "../types";
import { fetchRoundMetadata, handleResponse } from "../utils";
import {
  fetchQFContributionsForRound,
  summarizeQFContributions,
} from "../votingStrategies/linearQuadraticFunding";
import { hotfixForRounds } from "../hotfixes";
import { cache } from "../cacheConfig";
import { db } from "../database";

/**
 * updateRoundSummaryHandler is a function that handles HTTP requests for summary information for a given round.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response that will be sent.
 * @returns {void}
 */
export const updateRoundSummaryHandler = async (
  req: Request,
  res: Response
) => {
  const { chainId, roundId } = req.params;

  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId or roundId"
    );
  }

  try {
    const metadata = await fetchRoundMetadata(chainId as ChainId, roundId);
    const { votingStrategy } = metadata;

    const votingStrategyName = votingStrategy.strategyName as VotingStrategy;

    // throw error if voting strategy is not supported
    if (votingStrategyName !== VotingStrategy.LINEAR_QUADRATIC_FUNDING) {
      throw "error: unsupported voting strategy";
    }

    const results = await getRoundSummary(
      chainId as ChainId,
      roundId,
      metadata
    );
    try {
      const upsertRoundStatus = await db.upsertRoundSummaryRecord(
        chainId,
        roundId,
        metadata,
        results
      );
      if (upsertRoundStatus.error) {
        throw upsertRoundStatus.error;
      }

      const roundSummary = await db.getRoundSummaryRecord(roundId);
      if (roundSummary.error) {
        throw roundSummary.error;
      }

      cache.set(`cache_${req.originalUrl}`, roundSummary.result);

      return handleResponse(
        res,
        200,
        `${req.originalUrl}`,
        roundSummary.result
      );
    } catch (error) {
      console.error("updateRoundSummaryHandler", error);
      const dbFailResults = {
        id: null,
        createdAt: null,
        updatedAt: new Date(),
        ...results,
        roundId: roundId,
      };
      cache.set(`cache_${req.originalUrl}`, dbFailResults);
      return handleResponse(res, 200, `${req.originalUrl}`, dbFailResults);
    }
  } catch (error) {
    console.error("updateRoundSummaryHandler", error);
    return handleResponse(res, 500, "error: something went wrong");
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
  roundMetadata: RoundMetadata
): Promise<QFContributionSummary> => {
  let results: QFContributionSummary;

  let { id: votingStrategyId, strategyName } = roundMetadata.votingStrategy;

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch contributions
      let contributions = await fetchQFContributionsForRound(
        chainId,
        votingStrategyId
      );

      contributions = await hotfixForRounds(roundId, contributions);

      // fetch round stats
      results = await summarizeQFContributions(chainId, contributions);
      break;
    default:
      throw "error: unsupported voting strategy";
  }

  return results;
};
