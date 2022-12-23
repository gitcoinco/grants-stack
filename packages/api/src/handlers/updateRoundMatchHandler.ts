import {
  ChainId,
  QFContribution, Results,
  RoundMetadata,
} from "../types";
import {Request, Response} from "express";
import {
  fetchAverageTokenPrices,
  fetchProjectIdToPayoutAddressMapping,
  fetchRoundMetadata, getChainVerbose,
  handleResponse,
} from "../utils";
import {fetchQFContributionsForRound} from "../votingStrategies/linearQuadraticFunding";
import {formatUnits} from "ethers/lib/utils";
import {VotingStrategy} from "@prisma/client";
import {hotfixForRounds} from "../hotfixes";
import {cache} from "../cacheConfig";
import {db} from "../database";

export const updateRoundMatchHandler = async (req: Request, res: Response) => {
  const {chainId, roundId} = req.params;

  // check if params are valid
  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId or roundId"
    );
  }

  let results: Results | undefined;

  try {
    const metadata = await fetchRoundMetadata(chainId as ChainId, roundId);
    const {votingStrategy} = metadata;

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
        await db.upsertRoundRecord(
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
        )

        // save the distribution results to the db
        // TODO: figure out if there is a better way to batch transactions
        for (const projectMatch of results.distribution) {
          await db.upsertProjectMatchRecord(chainId, roundId, metadata, projectMatch)
        }

        const match = await db.getRoundMatchRecord(roundId);

        cache.set(`cache_${req.originalUrl}`, match);
        return handleResponse(res, 200, `${req.originalUrl}`, match);
      } catch
        (error) {
        console.error("updateRoundMatchHandler", error);

        results.distribution = results.distribution.map((dist: any) => {
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
        return handleResponse(
          res,
          200,
          `${req.originalUrl}`,
          dbFailResults
        );
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
) : Promise<Results> => {
  const {totalPot, roundStartTime, roundEndTime, token} = metadata;

  let isSaturated: boolean;

  const contributionsByProject: {
    [projectId: string]: any;
  } = {};

  const projectIdToPayoutMapping = await fetchProjectIdToPayoutAddressMapping(
    metadata.projectsMetaPtr
  );

  let contributionTokens: string[] = [];

  // group contributions by project
  for (const contribution of contributions) {
    const {projectId, amount, token, contributor} = contribution;

    if (!contributionTokens.includes(token)) {
      contributionTokens.push(token);
    }

    if (!contributionsByProject[projectId]) {
      contributionsByProject[projectId] = {
        contributions: contribution ? {[contributor]: contribution} : {},
      };
    }

    if (!contributionsByProject[projectId].contributions[contributor]) {
      contributionsByProject[projectId].contributions[contributor] = {
        ...contribution,
      };
    } else {
      contributionsByProject[projectId].contributions[contributor].amount =
        amount.add(amount);
    }
  }

  const prices: any = await fetchAverageTokenPrices(
    chainId,
    contributionTokens,
    roundStartTime,
    roundEndTime
  );

  const matchResults = [];
  let totalMatchInUSD = 0;
  for (const projectId in contributionsByProject) {
    let sumOfSquares = 0;
    let sumOfContributions = 0;

    Object.values(contributionsByProject[projectId].contributions).forEach(
      (contribution: any) => {
        const {amount, token} = contribution;
        // If token is not in prices list, skip it -- LOOK INTO THIS
        if (prices[token] > 0) {
          const convertedAmount = Number(formatUnits(amount)) * prices[token];
          sumOfSquares += Math.sqrt(convertedAmount);
          sumOfContributions += convertedAmount;
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
    });
    totalMatchInUSD += isNaN(matchInUSD) ? 0 : matchInUSD; // TODO: what should happen when matchInUSD is NaN?
    // TODO: Error out if NaN
  }

  for (const matchResult of matchResults) {
    matchResult.matchPoolPercentage = matchResult.matchAmountInUSD / totalMatchInUSD;
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
      result.matchAmountInUSD *= (totalPot * potTokenPrice[token]) / totalMatchInUSD;
    });
  }

  return {
    distribution: matchResults,
    isSaturated: isSaturated,
  };
};
