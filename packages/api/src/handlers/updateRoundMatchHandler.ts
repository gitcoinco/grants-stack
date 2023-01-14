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

  // const contributionsByProject: {
  //   [projectId: string]: any;
  // } = {};
  // // group contributions by project
  // for (const contribution of contributions) {
  //   const { projectId, amount, token, contributor } = contribution;
  //
  //   if (!prices[token] || prices[token] < 0) {
  //     continue; // skip
  //   }
  //
  //   if (!contributionsByProject[projectId]) {
  //     contributionsByProject[projectId] = {
  //       contributions: contribution ? { [contributor]: contribution } : {},
  //     };
  //   }
  //
  //   if (!contributionsByProject[projectId].contributions[contributor]) {
  //     contributionsByProject[projectId].contributions[contributor] = {
  //       ...contribution,
  //       usdValue: Number(formatUnits(amount)) * prices[token],
  //     };
  //   } else {
  //     contributionsByProject[projectId].contributions[contributor].usdValue += Number(
  //       formatUnits(amount)
  //     ) * prices[token];
  //   }
  // }

  for (const contribution of contributions) {
    const { projectId, amount, token, contributor } = contribution;

    if (!prices[token] || prices[token] < 0) {
      contribution.usdValue = 0;
    } else {
      contribution.usdValue = Number(formatUnits(amount)) * prices[token];
    }

  }

  const calculateQFMatch = (contributions: QFContribution[]) => {
    // Create an empty object to store the project matches
    const projectMatches: { [projectId: string]: {
      usdValue: number;
      isSaturated: boolean;
      } } = {
    };

    // Iterate through each contribution
    for (const contribution of contributions) {
      // Check if the contribution has a usdValue
      if (contribution.usdValue) {
        // Check if the projectId is already in the projectMatches object
        if (projectMatches[contribution.projectId]) {
          // If it is, add the square-root of the usdValue to the existing match
          projectMatches[contribution.projectId].usdValue += Math.sqrt(contribution.usdValue);
        } else {
          projectMatches[contribution.projectId] = {
            usdValue: Math.sqrt(contribution.usdValue),
            isSaturated: false,
          }
        }
      }
    }

    let totalMatch = 0;
    // Iterate through the projectMatches object
    for (const projectId in projectMatches) {
      // Square the project match to get the quadratic funding match
      projectMatches[projectId].usdValue = Math.pow(projectMatches[projectId].usdValue, 2);
      totalMatch += projectMatches[projectId].usdValue;
    }

    if (totalMatch > matchPotInUsd * 0.1) {
      for (const projectId in projectMatches) {
        projectMatches[projectId].isSaturated = true;
      }
    }

    return projectMatches;
  }

  const projectMatches = calculateQFMatch(contributions);
  // console.log("projectMatches", projectMatches)


  // normalize the project matches
  const normalizeProjectMatches = (projectMatches: { [projectId: string]: {
    usdValue: number;
    isSaturated: boolean;
    } }, scale: number, cap: number) => {
    for (const projectId in projectMatches) {
        projectMatches[projectId].usdValue = (projectMatches[projectId].usdValue / scale) * matchPotInUsd;
        projectMatches[projectId].isSaturated = projectMatches[projectId].usdValue > cap;
    }

    return projectMatches;
  }

  // sum of all project matches
  let totalMatch = 0;
  for (const projectId in projectMatches) {
    totalMatch += projectMatches[projectId].usdValue;
  }

  const normalizedProjectMatches = normalizeProjectMatches(projectMatches, totalMatch, matchPotInUsd * 0.1);
  // console.log("normalizedProjectMatches", normalizedProjectMatches)

  // cap the matches
  const capProjectMatches = (projectMatches: { [projectId: string]: {
    usdValue: number;
    isSaturated: boolean;
    } }, cap: number) => {
    for (const projectId in projectMatches) {
      if (projectMatches[projectId].usdValue > cap) {
        projectMatches[projectId].usdValue = cap;
      }
    }
    return projectMatches;
  }

  const cappedProjectMatches = capProjectMatches(normalizedProjectMatches, matchPotInUsd * 0.1);
  // console.log("cappedProjectMatches", cappedProjectMatches)

  let totalCappedMatch = 0;
  for (const projectId in cappedProjectMatches) {
    totalCappedMatch += cappedProjectMatches[projectId].usdValue;
  }

  // get the remaining match pot
  const remainingMatchPot = matchPotInUsd - totalCappedMatch;

  const distributeRemainingMatchPot: any = (projectMatches: { [projectId: string]: {
      usdValue: number;
      isSaturated: boolean;
    } }, remainingMatchPot: number) => {
    console.log("remainingMatchPot", remainingMatchPot)
    if (remainingMatchPot <= 0) {
      return projectMatches;
    }
    let unsaturatedTotalMatch = 0;
    for (const projectId in projectMatches) {
      if (!projectMatches[projectId].isSaturated) {
        unsaturatedTotalMatch += projectMatches[projectId].usdValue;
      }
    }

    for (const projectId in projectMatches) {
      if (!projectMatches[projectId].isSaturated) {
        projectMatches[projectId].usdValue += (projectMatches[projectId].usdValue / unsaturatedTotalMatch) * remainingMatchPot;
        remainingMatchPot -= projectMatches[projectId].usdValue;
      }
    }
    return distributeRemainingMatchPot(projectMatches, remainingMatchPot);
  }

  const distributedProjectMatches = distributeRemainingMatchPot(cappedProjectMatches, remainingMatchPot);

  // sum of all project matches
  let totalDistributedMatch = 0;
  for (const projectId in distributedProjectMatches) {
    totalDistributedMatch += distributedProjectMatches[projectId].usdValue;
  }
  console.log("totalDistributedMatch", totalDistributedMatch)

  // console.log("distributedProjectMatches", distributedProjectMatches)

  // distribute the remaining match pot
  // const distributeRemainingMatchPot = (projectMatches: { [projectId: string]: {
  //   usdValue: number;
  //   isSaturated: boolean;
  //   } }, remainingMatchPot: number) => {
  //   let unsaturatedTotalMatch = 0;
  //   for (const projectId in projectMatches) {
  //     if (!projectMatches[projectId].isSaturated) {
  //       unsaturatedTotalMatch += projectMatches[projectId].usdValue;
  //     }
  //   }
  //
  //   for (const projectId in projectMatches) {
  //     if (!projectMatches[projectId].isSaturated) {
  //       projectMatches[projectId].usdValue += (projectMatches[projectId].usdValue / unsaturatedTotalMatch) * remainingMatchPot;
  //     }
  //   }
  // }

  // const capProjectMatches = (projectMatches: { [projectId: string]: number }) => {
  //   for (const projectId in projectMatches) {
  //     if (projectMatches[projectId] > matchPotInUsd * 0.1) {
  //       projectMatches[projectId] = matchPotInUsd * 0.1;
  //       console.log("capped match", projectMatches[projectId])
  //     }
  //   }
  //   return projectMatches;
  // }
  //
  // const cappedProjectMatches = capProjectMatches(normalizedProjectMatches);
  // console.log("cappedProjectMatches", cappedProjectMatches)

  // // calculate total usd value of all contributions
  // let totalUsdValue = 0;
  // for (const projectId in contributionsByProject) {
  //   const project = contributionsByProject[projectId];
  //   for (const contributor in project.contributions) {
  //     const contribution = project.contributions[contributor];
  //     totalUsdValue += contribution.usdValue;
  //   }
  // }
  //
  // // calculate the quadratic funding match for each project
  // let sumOfProjectMatchesInUsd = 0;
  // for (const projectId in contributionsByProject) {
  //   const project = contributionsByProject[projectId];
  //   let sumOfProjectContributionsInUsd = 0;
  //   let sumOfRootProjectContributionsInUsd = 0;
  //   for (const contributor in project.contributions) {
  //     const contribution = project.contributions[contributor];
  //     sumOfProjectContributionsInUsd += contribution.usdValue;
  //     sumOfRootProjectContributionsInUsd += Math.sqrt(contribution.usdValue);
  //   }
  //   const projectMatchInUsd = Math.pow(sumOfRootProjectContributionsInUsd, 2);
  //   sumOfProjectMatchesInUsd += projectMatchInUsd;
  // }
  //
  // // normalize the project matches to the total pot
  // for (const projectId in contributionsByProject) {
  //   const project = contributionsByProject[projectId];
  //   for (const contributor in project.contributions) {
  //     const contribution = project.contributions[contributor];
  //
  //   }
  // }


  //
  const matchResults: QFDistribution[] = [];
  // let totalMatchInUSD = 0;
  // for (const projectId in contributionsByProject) {
  //   let sumOfSquares = 0;
  //   let sumOfContributions = 0;
  //
  //   const uniqueContributors = new Set();
  //
  //   const contributions: QFContribution[] = Object.values(contributionsByProject[projectId].contributions);
  //   contributions.forEach(contribution => {
  //       const { contributor, usdValue } = contribution;
  //
  //       uniqueContributors.add(contributor);
  //
  //       if (usdValue) {
  //         sumOfSquares += Math.sqrt(usdValue);
  //         sumOfContributions += usdValue;
  //       }
  //     }
  //   );
  //
  //   const matchInUSD = Math.pow(sumOfSquares, 2) - sumOfContributions;
  //
  //   const projectPayoutAddress = projectIdToPayoutMapping.get(projectId)!;
  //
  //   matchResults.push({
  //     projectId: projectId,
  //     matchAmountInUSD: matchInUSD,
  //     totalContributionsInUSD: sumOfContributions,
  //     matchPoolPercentage: 0, // init to zero
  //     matchAmountInToken: 0,
  //     projectPayoutAddress: projectPayoutAddress,
  //     uniqueContributorsCount: uniqueContributors.size,
  //   });
  //   totalMatchInUSD += isNaN(matchInUSD) ? 0 : matchInUSD; // TODO: what should happen when matchInUSD is NaN?
  //   // TODO: Error out if NaN
  // }
  //
  // for (const matchResult of matchResults) {
  //   matchResult.matchPoolPercentage =
  //     matchResult.matchAmountInUSD / totalMatchInUSD;
  //   matchResult.matchAmountInToken = matchResult.matchPoolPercentage * totalPot;
  // }
  //
  // const potTokenPrice: any = await fetchAverageTokenPrices(
  //   chainId,
  //   [token],
  //   roundStartTime,
  //   roundEndTime
  // );
  //
  // isSaturated = totalMatchInUSD > totalPot * potTokenPrice[token];
  //
  // // NOTE: Investigate how this may affect matching token and percentage calculations
  // if (isSaturated) {
  //   matchResults.forEach((result) => {
  //     result.matchAmountInUSD *=
  //       (totalPot * potTokenPrice[token]) / totalMatchInUSD;
  //   });
  // }
  //
  return {
    distribution: matchResults,
    isSaturated: true,//isSaturated,
  };
};
