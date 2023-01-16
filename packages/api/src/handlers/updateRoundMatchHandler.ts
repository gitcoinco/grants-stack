import { query, Request, Response } from "express";
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
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { VotingStrategy } from "@prisma/client";
import { hotfixForRounds } from "../hotfixes";
import { cache } from "../cacheConfig";
import { db } from "../database";
import { BigNumber, FixedNumber } from "ethers";

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

export const matchQFContributions = async (
  chainId: ChainId,
  metadata: RoundMetadata,
  contributions: QFContribution[]
): Promise<QFDistributionResults> => {
  const { totalPot, roundStartTime, roundEndTime, token } = metadata;

  let isSaturated: boolean;

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

  const matchPotInUsd = prices[token] * totalPot;
  const matchPotInToken = parseUnits(totalPot.toFixed(18), 18);

  let roundToken = token;

  for (const contribution of contributions) {
    const { projectId, amount, token, contributor } = contribution;

    if (!prices[token] || prices[token] < 0) {
      contribution.usdValue = 0;
      contribution.roundTokenValue = BigNumber.from("0");
    } else {
      contribution.usdValue = Number(
        (Number(formatUnits(amount)) * prices[token]).toFixed(18)
      );
      contribution.roundTokenValue = parseUnits(
        (contribution.usdValue / prices[roundToken]).toFixed(18),
        18
      );
    }
  }

  function sqrtBN(x: BigNumber) {
    const ONE = BigNumber.from(1);
    const TWO = BigNumber.from(2);
    if (x.lte(BigNumber.from(0))) return BigNumber.from(0);
    let z = x.add(ONE).div(TWO);
    let y = x;
    while (z.sub(y).isNegative()) {
      y = z;
      z = x.div(z).add(z).div(TWO);
    }
    return y;
  }

  const calculateQFMatch = (contributions: QFContribution[]) => {
    // Create an empty object to store the project matches
    const projectMatches: {
      [projectId: string]: {
        usdValue: number;
        roundTokenValue: BigNumber;
        isSaturated: boolean;
      };
    } = {};

    // Iterate through each contribution
    for (const contribution of contributions) {
      // Check if the contribution has a usdValue
      if (contribution.usdValue && contribution.roundTokenValue) {
        // Check if the projectId is already in the projectMatches object
        if (projectMatches[contribution.projectId]) {
          // If it is, add the square-root of the usdValue to the existing match
          projectMatches[contribution.projectId].usdValue += Math.sqrt(
            contribution.usdValue
          );
          projectMatches[contribution.projectId].roundTokenValue =
            projectMatches[contribution.projectId].roundTokenValue.add(
              sqrtBN(contribution.roundTokenValue)
            );
        } else {
          projectMatches[contribution.projectId] = {
            usdValue: Math.sqrt(contribution.usdValue),
            roundTokenValue: sqrtBN(contribution.roundTokenValue),
            isSaturated: false,
          };
        }
      }
    }

    let totalMatch = 0;
    // Iterate through the projectMatches object
    for (const projectId in projectMatches) {
      // Square the project match to get the quadratic funding match
      projectMatches[projectId].usdValue = Math.pow(
        projectMatches[projectId].usdValue,
        2
      );
      projectMatches[projectId].roundTokenValue =
        projectMatches[projectId].roundTokenValue.pow(2);
      totalMatch += projectMatches[projectId].usdValue;
    }

    if (totalMatch > matchPotInUsd * 0.1) {
      for (const projectId in projectMatches) {
        projectMatches[projectId].isSaturated = true;
      }
    }

    return projectMatches;
  };

  const projectMatches = calculateQFMatch(contributions);

  const normalizeProjectMatches = (
    projectMatches: {
      [projectId: string]: {
        usdValue: number;
        roundTokenValue: BigNumber;
        isSaturated: boolean;
      };
    },
    scaleInUsd: number,
    capInUsd: number,
    scaleInToken: BigNumber,
    capInToken: BigNumber
  ) => {
    for (const projectId in projectMatches) {
      projectMatches[projectId].usdValue =
        (projectMatches[projectId].usdValue / scaleInUsd) * matchPotInUsd;
      projectMatches[projectId].roundTokenValue = BigNumber.from(
        projectMatches[projectId].roundTokenValue
          .mul(BigNumber.from("10").pow(BigNumber.from("18")))
          .div(scaleInToken)
          .mul(matchPotInToken)
          .toString()
          .slice(0, 18)
      );
      projectMatches[projectId].isSaturated =
        projectMatches[projectId].usdValue > capInUsd;
    }

    return projectMatches;
  };

  // sum of all project matches
  let totalMatchInUsd = 0;
  let totalMatchInRoundToken = BigNumber.from("0");
  for (const projectId in projectMatches) {
    totalMatchInUsd += projectMatches[projectId].usdValue;
    totalMatchInRoundToken = totalMatchInRoundToken.add(
      projectMatches[projectId].roundTokenValue
    );
  }

  const matchCapInToken = matchPotInToken.div(BigNumber.from("10"));

  const normalizedProjectMatches = normalizeProjectMatches(
    projectMatches,
    totalMatchInUsd,
    matchPotInUsd * 0.1,
    totalMatchInRoundToken,
    matchCapInToken
  );

  // cap the matches
  const capProjectMatches = (
    projectMatches: {
      [projectId: string]: {
        usdValue: number;
        roundTokenValue: BigNumber;
        isSaturated: boolean;
      };
    },
    cap: number
  ) => {
    for (const projectId in projectMatches) {
      if (projectMatches[projectId].usdValue > cap) {
        projectMatches[projectId].usdValue = cap;
        projectMatches[projectId].roundTokenValue = parseUnits(
          (projectMatches[projectId].usdValue / prices[token]).toFixed(18),
          18
        );
      }
    }
    return projectMatches;
  };

  const cappedProjectMatches = capProjectMatches(
    normalizedProjectMatches,
    matchPotInUsd * 0.1
  );

  let totalCappedMatchInUsd = 0;
  let totalCappedMatchInTokens = BigNumber.from("0");
  for (const projectId in cappedProjectMatches) {
    totalCappedMatchInUsd += cappedProjectMatches[projectId].usdValue;
    totalCappedMatchInTokens = totalCappedMatchInTokens.add(
      cappedProjectMatches[projectId].roundTokenValue
    );
  }

  // get the remaining match pot
  const remainingMatchPotInUsd = matchPotInUsd - totalCappedMatchInUsd;
  const remainingMatchPotInTokens = matchPotInToken.sub(
    totalCappedMatchInTokens
  );

  const distributeRemainingMatchPot: any = (
    projectMatches: {
      [projectId: string]: {
        usdValue: number;
        roundTokenValue: BigNumber;
        isSaturated: boolean;
      };
    },
    remainingMatchPotInToken: BigNumber
  ) => {
    if (remainingMatchPotInToken.lte(parseUnits("100", "wei"))) {
      // give dust to random project
      const randomProjectId =
        Object.keys(projectMatches)[
          Math.floor(Math.random() * Object.keys(projectMatches).length)
        ];
      projectMatches[randomProjectId].roundTokenValue = projectMatches[
        randomProjectId
      ].roundTokenValue.add(remainingMatchPotInToken);
      return projectMatches;
    }

    let unsaturatedTotalMatchInToken = BigNumber.from("0");
    let saturatedTotalMatchInToken = BigNumber.from("0");
    for (const projectId in projectMatches) {
      if (!projectMatches[projectId].isSaturated) {
        unsaturatedTotalMatchInToken = unsaturatedTotalMatchInToken.add(
          projectMatches[projectId].roundTokenValue
        );
      } else {
        saturatedTotalMatchInToken = saturatedTotalMatchInToken.add(
          projectMatches[projectId].roundTokenValue
        );
      }
    }

    for (const projectId in projectMatches) {
      if (!projectMatches[projectId].isSaturated) {
        projectMatches[projectId].roundTokenValue = projectMatches[
          projectId
        ].roundTokenValue.add(
          remainingMatchPotInToken.mul(
            projectMatches[projectId].roundTokenValue.div(
              unsaturatedTotalMatchInToken
            )
          )
        );
        remainingMatchPotInToken = remainingMatchPotInToken.sub(
          projectMatches[projectId].roundTokenValue
        );
      }
    }
    return distributeRemainingMatchPot(
      projectMatches,
      remainingMatchPotInToken
    );
  };

  const distributedProjectMatches = distributeRemainingMatchPot(
    cappedProjectMatches,
    remainingMatchPotInTokens
  );

  // assert the total match amount is equal to the match pot
  let totalMatchInTokens = BigNumber.from("0");
  for (const projectId in distributedProjectMatches) {
    totalMatchInTokens = totalMatchInTokens.add(
      distributedProjectMatches[projectId].roundTokenValue
    );
  }

  const matchResults: QFDistribution[] = [];

  return {
    distribution: matchResults,
    isSaturated: true, //isSaturated,
  };
};
