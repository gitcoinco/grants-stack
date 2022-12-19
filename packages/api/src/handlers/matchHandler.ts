import {
  ChainId,
  QFVote, Results,
  RoundMetadata,
} from "../types";
import { Request, Response } from "express";
import {
  fetchAverageTokenPrices,
  fetchRoundMetadata, getChainVerbose,
  handleResponse,
} from "../utils";
import { fetchQFContributionsForRound } from "../votingStrategies/linearQuadraticFunding";
import { formatUnits } from "ethers/lib/utils";
import { PrismaClient, VotingStrategy } from "@prisma/client";

const prisma = new PrismaClient();

export const matchHandler = async (req: Request, res: Response) => {
  const { chainId, roundId } = req.params;

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

    switch (votingStrategy.strategyName) {
      case "LINEAR_QUADRATIC_FUNDING":
        const contributions = await fetchQFContributionsForRound(
          chainId as ChainId,
          votingStrategy.id
        );
        results = await matchQFContributions(
          chainId as ChainId,
          metadata,
          contributions
        );
        break;
    }

    if (results) {
      // update result is round saturation has changed
      if (round.isSaturated != results.isSaturated) {
        await prisma.round.update({
          where: { id: round.id },
          data: { isSaturated: results.isSaturated },
        });
      }

      // save the distribution results to the db
      // TODO: figure out if there is a better way to batch transactions
      for (const projectMatch of results.distribution) {
        await prisma.match.upsert({
          where: {
            matchIdentifier: {
              projectId: projectMatch.projectId,
              roundId: round.id,
            },
          },
          update: {
            amount: projectMatch.match,
          },
          create: {
            amount: projectMatch.match,
            projectId: projectMatch.projectId,
            contributionCount: Number(projectMatch.contributionCount),
            sumOfContributions: Number(projectMatch.sumOfContributions),
            roundId: round.id,
          },
        });
      }
    }
  } catch (error) {
    return handleResponse(res, 500, "error: something went wrong");
  }

  return handleResponse(res, 200, "match calculations", results);
};

export const matchQFContributions = async (
  chainId: ChainId,
  metadata: RoundMetadata,
  contributions: QFVote[]
) => {
  const { totalPot, roundStartTime, roundEndTime, token } = metadata;
  const contributionAddresses = new Set<string>();

  let isSaturated: boolean;

  const contributionsByProject: {
    [projectId: string]: any;
  } = {};

  let contributionTokens: string[] = [];
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
      contributionAddresses.add(contributor);
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
  let totalMatch = 0;
  for (const projectId in contributionsByProject) {
    let sumOfSquares = 0;
    let sumOfContributions = 0;
    let contributionCount = 0;

    Object.values(contributionsByProject[projectId].contributions).forEach(
      (contribution: any) => {
        const { amount, token } = contribution;
        // If token is not in prices list, skip it -- LOOK INTO THIS
        if (prices[token] > 0) {
          const convertedAmount = Number(formatUnits(amount)) * prices[token];
          sumOfSquares += Math.sqrt(convertedAmount);
          sumOfContributions += convertedAmount;
          contributionCount++;
        }
      }
    );

    const match = Math.pow(sumOfSquares, 2) - sumOfContributions;

    matchResults.push({
      projectId,
      match,
      sumOfContributions,
      contributionCount,
    });
    totalMatch += isNaN(match) ? 0 : match; // TODO: what should happen when match is NaN?
  }

  const potTokenPrice: any = await fetchAverageTokenPrices(
    chainId,
    [token],
    roundStartTime,
    roundEndTime
  );

  isSaturated = totalMatch > totalPot * potTokenPrice[token];

  if (isSaturated) {
    matchResults.forEach((result) => {
      result.match *= (totalPot * potTokenPrice[token]) / totalMatch;
    });
  }

  return {
    distribution: matchResults,
    isSaturated,
  };
};
