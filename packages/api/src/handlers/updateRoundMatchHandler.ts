import { Request, Response } from "express";
import { ChainId, QFDistributionResults } from "../types";
import { fetchRoundMetadata, getChainVerbose, handleResponse } from "../utils";
import {
  fetchQFContributionsForRound,
  matchQFContributions,
} from "../votingStrategies/linearQuadraticFunding";
import { VotingStrategy } from "@prisma/client";
import { hotfixForRounds } from "../hotfixes";
import { cache } from "../cacheConfig";
import { db } from "../database";

export const updateRoundMatchHandler = async (req: Request, res: Response) => {
  const { chainId, roundId } = req.params;

  // check if params are valid
  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId or roundId"
    );
  }

  let results: QFDistributionResults | undefined;

  try {
    const metadata = await fetchRoundMetadata(chainId as ChainId, roundId);
    const { votingStrategy } = metadata;

    const votingStrategyName = votingStrategy.strategyName as VotingStrategy;

    const chainIdVerbose = getChainVerbose(chainId);

    switch (votingStrategyName) {
      case "LINEAR_QUADRATIC_FUNDING":
        let contributions = await fetchQFContributionsForRound(
          chainId as ChainId,
          votingStrategy.id
        );

        contributions = await hotfixForRounds(roundId, contributions);

        results = await matchQFContributions(
          chainId as ChainId,
          metadata,
          contributions
        );

        break;
    }

    if (results) {
      try {
        const upsetRecordStatus = await db.upsertRoundRecord(
          roundId,
          {
            isSaturated: results.isSaturated,
          },
          {
            chainId: chainIdVerbose,
            roundId: roundId,
            votingStrategyName: votingStrategyName,
            isSaturated: results.isSaturated,
          }
        );
        if (upsetRecordStatus.error) {
          throw upsetRecordStatus.error;
        }

        // save the distribution results to the db
        // TODO: figure out if there is a better way to batch transactions
        for (const projectMatch of results.distribution) {
          const upsertMatchStatus = await db.upsertProjectMatchRecord(
            chainId,
            roundId,
            metadata,
            projectMatch
          );
          if (upsetRecordStatus.error) {
            throw upsertMatchStatus.error;
          }
        }

        const match = await db.getRoundMatchRecord(roundId);
        if (match.error) {
          throw match.error;
        }

        cache.set(`cache_${req.originalUrl}`, match.result);
        return handleResponse(res, 200, `${req.originalUrl}`, match.result);
      } catch (error) {
        console.error(error);

        results.distribution = results.distribution.map((dist) => {
          return {
            id: null,
            createdAt: null,
            updatedAt: new Date(),
            ...dist,
            roundId: roundId,
          };
        });
        const dbFailResults = results.distribution;

        cache.set(`cache_${req.originalUrl}`, dbFailResults);
        return handleResponse(res, 200, `${req.originalUrl}`, dbFailResults);
      }
    } else {
      throw "error: no results";
    }
  } catch (error) {
    console.error("updateRoundMatchHandler", error);
    return handleResponse(res, 500, "error: something went wrong");
  }
};
