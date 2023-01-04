import { Request, Response } from "express";
import { VotingStrategy } from "@prisma/client";
import { ChainId, QFContributionSummary, RoundMetadata } from "../types";
import { fetchRoundMetadata, handleResponse } from "../utils";
import {
  fetchQFContributionsForProjects,
  summarizeQFContributions,
} from "../votingStrategies/linearQuadraticFunding";
import { hotfixForRounds } from "../hotfixes";
import { cache } from "../cacheConfig";
import { db } from "../database";

/**
 * updateProjectSummaryHandler is a function that handles HTTP requests
 * for summary information for a given round and project.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response that will be sent.
 * @returns {void}
 */
export const updateProjectSummaryHandler = async (
  req: Request,
  res: Response
) => {
  const { chainId, roundId, projectId } = req.params;

  if (!chainId || !roundId || !projectId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId, roundId, or projectId"
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

    const results = await getProjectsSummary(
      chainId as ChainId,
      roundId,
      metadata,
      [projectId]
    );

    try {
      const upsertProjectSummaryStatus = await db.upsertProjectSummaryRecord(
        roundId,
        chainId,
        projectId,
        metadata,
        results
      );
      if (upsertProjectSummaryStatus.error) {
        throw upsertProjectSummaryStatus.error;
      }

      const projectSummary = await db.getProjectSummaryRecord(
        roundId,
        projectId
      );
      if (projectSummary.error) {
        throw projectSummary.error;
      }

      cache.set(`cache_${req.originalUrl}`, projectSummary.result);

      return handleResponse(
        res,
        200,
        `${req.originalUrl}`,
        projectSummary.result
      );
    } catch (error) {
      console.error("updateProjectSummaryHandler", error);
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
    console.error("updateProjectSummaryHandler", error);
    return handleResponse(res, 500, "error: something went wrong");
  }
};

/**
 * getProjectsSummary is a function that fetches metadata and summary information for a given round and set of projects from a GraphQL API.
 *
 * @param {ChainId} chainId - The ID of the chain to fetch data from.
 * @param {string} roundId - The ID of the round to fetch data for.
 * @param {string[]} projectIds - An array of project IDs to filter the summary data by.
 * @returns {Promise<QFContributionSummary>} A promise that resolves to an array of objects containing the summary data.
 */
export const getProjectsSummary = async (
  chainId: ChainId,
  roundId: string,
  roundMetadata: RoundMetadata,
  projectIds: string[]
): Promise<QFContributionSummary> => {
  let results: QFContributionSummary;

  let { id: votingStrategyId, strategyName } = roundMetadata.votingStrategy;

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch votes
      let contributions = await fetchQFContributionsForProjects(
        chainId,
        votingStrategyId,
        projectIds
      );

      contributions = await hotfixForRounds(roundId, contributions, projectIds);

      // fetch round stats
      results = await summarizeQFContributions(chainId, contributions);
      break;
    default:
      throw "error: unsupported voting strategy";
  }

  return results;
};
