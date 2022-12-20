import {
  ChainId,
  QFContribution, Results,
  RoundMetadata,
} from "../types";
import {Request, Response} from "express";
import {
  fetchAverageTokenPrices,
  fetchRoundMetadata, getChainVerbose,
  handleResponse,
} from "../utils";
import {fetchQFContributionsForRound} from "../votingStrategies/linearQuadraticFunding";
import {formatUnits} from "ethers/lib/utils";
import {PrismaClient, VotingStrategy} from "@prisma/client";
import NodeCache from "node-cache";
import {hotfixForRounds} from "../hotfixes/index";

const prisma = new PrismaClient();

// Schedule cache invalidation every 10 minutes
const cache = new NodeCache({stdTTL: 60 * 10, checkperiod: 60 * 10});
let updatedAt: Date;

export const matchHandler = async (req: Request, res: Response) => {
  const {chainId, roundId} = req.params;

  // check if force query is set
  const forceQuery = req.query.force === "true";

  // check if params are valid
  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId or roundId"
    );
  }

  // Load from internal cache if available
  const matchFromCache = cache.get(`${chainId}-${roundId}-match`);
  if (matchFromCache && !forceQuery) {
    return handleResponse(res, 200, `round match: ${roundId}`, {...matchFromCache, updatedAt});
  }

  let results: Results | undefined;

  try {
    const metadata = await fetchRoundMetadata(chainId as ChainId, roundId);
    const {votingStrategy} = metadata;

    const votingStrategyName = votingStrategy.strategyName as VotingStrategy;

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
        // cache the matchInUSD
        updatedAt = new Date();
        // update the cache
        cache.set(`${chainId}-${roundId}-match`, {...results, updatedAt});

        break;
    }

    if (results) {
      // update result is round saturation has changed
      if (round.isSaturated != results.isSaturated) {
        await prisma.round.update({
          where: {id: round.id},
          data: {isSaturated: results.isSaturated},
        });
      }

      // save the distribution results to the db
      // TODO: figure out if there is a better way to batch transactions
      for (const projectMatch of results.distribution) {
        const match = await prisma.match.upsert({
          where: {
            matchIdentifier: {
              roundId: roundId,
              projectId: projectMatch.projectId
            },
          },
          update: {
            matchAmountInUSD: projectMatch.matchAmountInUSD,
          },
          create: {
            matchAmountInUSD: projectMatch.matchAmountInUSD,
            projectId: projectMatch.projectId,
            totalContributionsInUSD: Number(projectMatch.totalContributionsInUSD),
            matchPoolPercentage: Number(projectMatch.matchPoolPercentage),
            matchAmountInToken: Number(projectMatch.matchAmountInToken),
            roundId: roundId,
          },
        });
      }
    }

  } catch (error) {
    console.log(error);
    return handleResponse(res, 500, "error: something went wrong");
  }

  return handleResponse(res, 200, `round match: ${roundId}`, {...results, updatedAt});
};

export const matchQFContributions = async (
  chainId: ChainId,
  metadata: RoundMetadata,
  contributions: QFContribution[]
) => {
  const {totalPot, roundStartTime, roundEndTime, token} = metadata;

  let isSaturated: boolean;

  const contributionsByProject: {
    [projectId: string]: any;
  } = {};

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

    matchResults.push({
      projectId: projectId,
      matchAmountInUSD: matchInUSD,
      totalContributionsInUSD: sumOfContributions,
      matchPoolPercentage: 0, // init to zero
      matchAmountInToken: 0,
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
    isSaturated,
  };
};
