import { Request, Response } from "express";
import {
  ChainId,
  QFContribution,
  QFDistribution,
  QFDistributionResults,
  RoundMetadata,
} from "../types";
import {
  fetchAverageTokenPrices,
  fetchProjectIdToPayoutAddressMapping,
  fetchRoundMetadata,
  getChainVerbose,
  handleResponse,
} from "../utils";
import { fetchQFContributionsForRound } from "../votingStrategies/linearQuadraticFunding";
import { formatUnits } from "ethers/lib/utils";
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

        results.distribution = results.distribution.map(dist => {
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

export const matchQFContributions = async (
  chainId: ChainId,
  metadata: RoundMetadata,
  contributions: QFContribution[]
): Promise<QFDistributionResults> => {
  const { totalPot, roundStartTime, roundEndTime, token } = metadata;

  let isSaturated: boolean;

  const contributionsByProject: {
    [projectId: string]: any;
  } = {};

  const projectIdToPayoutMapping = await fetchProjectIdToPayoutAddressMapping(
    metadata.projectsMetaPtr
  );

  let contributionTokens: string[] = [];

  for (const contribution of contributions) {
    if (!contributionTokens.includes(contribution.token)) {
      contributionTokens.push(contribution.token);
    }
  }

  const prices: any = await fetchAverageTokenPrices(
    chainId,
    contributionTokens,
    roundStartTime,
    roundEndTime
  );

  // group contributions by project
  for (const contribution of contributions) {
    const { projectId, amount, token, contributor } = contribution;

    if (!contributionTokens.includes(token)) {
      contributionTokens.push(token);
    }

    if (!contributionsByProject[projectId]) {
      contributionsByProject[projectId] = {
        contributions: contribution ? { [contributor]: contribution } : {},
      };
    }

    if (!contributionsByProject[projectId].contributions[contributor]) {
      contributionsByProject[projectId].contributions[contributor] = {
        ...contribution,
        usdValue: Number(formatUnits(amount)) * prices[token],
      };
    } else {
      contributionsByProject[projectId].contributions[contributor].usdValue += Number(
        formatUnits(amount)
      ) * prices[token];
    }
  }

  const matchResults: QFDistribution[] = [];
  let totalMatchInUSD = 0;
  for (const projectId in contributionsByProject) {
    let sumOfSquares = 0;
    let sumOfContributions = 0;

    const uniqueContributors = new Set();

    const contributions: QFContribution[] = Object.values(contributionsByProject[projectId].contributions);
    contributions.forEach(contribution => {
        const { contributor, usdValue } = contribution;

        uniqueContributors.add(contributor);

        if (usdValue) {
          sumOfSquares += Math.sqrt(usdValue);
          sumOfContributions += usdValue;
        }
      }
    );

    const matchInUSD = Math.pow(sumOfSquares, 2) - sumOfContributions;

    const projectPayoutAddress = projectIdToPayoutMapping.get(projectId)!;

    matchResults.push({
      projectId: projectId,
      matchAmountInUSD: matchInUSD,
      totalContributionsInUSD: sumOfContributions,
      matchPoolPercentage: 0, // init to zero
      matchAmountInToken: 0,
      projectPayoutAddress: projectPayoutAddress,
      uniqueContributorsCount: uniqueContributors.size,
    });
    totalMatchInUSD += isNaN(matchInUSD) ? 0 : matchInUSD; // TODO: what should happen when matchInUSD is NaN?
    // TODO: Error out if NaN
  }

  for (const matchResult of matchResults) {
    matchResult.matchPoolPercentage =
      matchResult.matchAmountInUSD / totalMatchInUSD;
    matchResult.matchAmountInToken = matchResult.matchPoolPercentage * totalPot;
  }

  const potTokenPrice: any = await fetchAverageTokenPrices(
    chainId,
    [token],
    roundStartTime,
    roundEndTime
  );

  isSaturated = totalMatchInUSD > totalPot * potTokenPrice[token];

  // NOTE: Investigate how this may affect matching token and percentage calculations
  if (isSaturated) {
    matchResults.forEach((result) => {
      result.matchAmountInUSD *=
        (totalPot * potTokenPrice[token]) / totalMatchInUSD;
    });
  }

  return {
    distribution: matchResults,
    isSaturated: isSaturated,
  };
};
