import {
  ChainId,
  QFContribution,
  QFDistribution,
  QFDistributionResults, QFVotedEvent,
  RoundMetadata,
} from "../types";
import { Request, Response } from "express";
import {
  fetchAverageTokenPrices, fetchProjectDataFromGraphByIds,
  fetchProjectIdToPayoutAddressMapping,
  fetchRoundMetadata, fetchRoundProjectsFromGraph, fetchVotesForProjectFromGraph, fetchVotesForRoundFromGraph,
  getChainVerbose,
  handleResponse,
} from "../utils";
import { fetchQFContributionsForRound } from "../votingStrategies/linearQuadraticFunding";
import { formatUnits, parseEther } from "ethers/lib/utils";
import { VotingStrategy } from "@prisma/client";
import { hotfixForRounds } from "../hotfixes";
import { cache } from "../cacheConfig";
import { db } from "../database";
import { BigNumber } from "ethers";

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
        //   let contributions = await fetchQFContributionsForRound(
        //     chainId as ChainId,
        //     votingStrategy.id
        //   );

        let votes = await fetchVotesForRoundFromGraph(chainId as ChainId, roundId)


        // console.log(votes)

        // contributions = await hotfixForRounds(roundId, contributions);
        //
        results = await matchQFContributions(
          chainId as ChainId,
          roundId,
          metadata,
          votes
        );

        // console.log(results)

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
  roundId: string,
  metadata: RoundMetadata,
  voteEvents: QFVotedEvent[]
): Promise<QFDistributionResults> => {
  const { totalPot, roundStartTime, roundEndTime, token } = metadata;

  let isSaturated: boolean;

  const voteEventsGroupedById: {
    [projectRegistryId: string]: QFVotedEvent[];
  } = {};

  // const projectIdToPayoutMapping = await fetchProjectIdToPayoutAddressMapping(
  //   metadata.projectsMetaPtr
  // );

  const pdata = await fetchRoundProjectsFromGraph(chainId, roundId);
  // console.log("pdata", pdata);
  //
  // console.log(voteEvents)

  // if contribution version is 0.1.0
  //  get the project id from the pdata
  // else
  //  use event project id
  let uniqueTokensOfRound: string[] = [];
  let uniqueVotersOfRound: string[] = [];
  for (const vote of voteEvents) {
    // console.log(contribution)
    const project = pdata.find(p => p.payoutAddress?.toLowerCase() === vote.to?.toLowerCase());
    if (project?.status === "REJECTED") {
      console.log("project rejected", project)
      continue;
    }
    // console.log("project", project)
    let projectRegistryId: string | undefined;
    if (vote.version === "0.1.0") {

      projectRegistryId = project?.id;
    } else {
      projectRegistryId = vote.projectId;
    }

    if (projectRegistryId) {
      if (!uniqueTokensOfRound.includes(vote.token.toLowerCase())) {
        uniqueTokensOfRound.push(vote.token.toLowerCase());
      }
      if (!uniqueVotersOfRound.includes(vote.from.toLowerCase())) {
        uniqueVotersOfRound.push(vote.from.toLowerCase());
      }
      if (!voteEventsGroupedById[projectRegistryId]) {
        voteEventsGroupedById[projectRegistryId] = [];
      }
      voteEventsGroupedById[projectRegistryId].push(vote);
    }

  }
  // console.log("uniqueTokens", uniqueTokens.length)
  // console.log("uniqueVoters", uniqueVoters.length)
  // console.log("voteEventsGroupedById", voteEventsGroupedById)


  // reduce the voteEvents to count the number of unique voters per project
  const uniqueVotersPerProject: {
    [projectRegistryId: string]: {count: number};
  } = {};
  for (const projectRegistryId in voteEventsGroupedById) {
    const votes = voteEventsGroupedById[projectRegistryId];
    const uniqueVoters = [...new Set(votes.map(v => v.from.toLowerCase()))];
    uniqueVotersPerProject[projectRegistryId] = {
      count: uniqueVoters.length
    }
  }
  // console.log("uniqueVotersPerProject", uniqueVotersPerProject)


  // reduce the voteEventGroupedById to a {amount: BigNumber, token: string, uniqueVoters: number }[] for each project
  const projectVotesGroupedByVoteToken: {
    [projectRegistryId: string]: { amount: BigNumber; token: string, uniqueVoters: string[]}[];
  } = {};

  for (const projectRegistryId in voteEventsGroupedById) {
    const votes = voteEventsGroupedById[projectRegistryId];
    const votesReduced: { amount: BigNumber; token: string, uniqueVoters: string[]}[] = [];
    for (const vote of votes) {
      const voteIndex = votesReduced.findIndex(
        v => v.token.toLowerCase() === vote.token.toLowerCase()
      );
      if (voteIndex > -1) {
        votesReduced[voteIndex].amount = votesReduced[voteIndex].amount.add(
          vote.amount
        );
        // check if from is unique
        if (!votesReduced[voteIndex].uniqueVoters.includes(vote.from.toLowerCase())) {
          votesReduced[voteIndex].uniqueVoters.push(vote.from.toLowerCase());
        }
      } else {
        votesReduced.push({ amount: vote.amount, token: vote.token, uniqueVoters: [vote.from.toLowerCase()] });
      }
    }
    projectVotesGroupedByVoteToken[projectRegistryId] = votesReduced;
  }

  // console.log(projectVotesGroupedByVoteToken)


  const prices: any = await fetchAverageTokenPrices(
    chainId,
    [...uniqueTokensOfRound, metadata.token.toLowerCase()],
    roundStartTime,
    roundEndTime
  );

  // convert the vote amounts to the token of the round and usd
  const projectVotesGroupedByTokenConvertedToUSD: {
    [projectRegistryId: string]: { tokenAmount: number; token: string, usdAmount: number, roundTokenAmount: number }[];
  } = {};

  for (const projectRegistryId in projectVotesGroupedByVoteToken) {
    const votes = projectVotesGroupedByVoteToken[projectRegistryId];
    const votesConverted: { tokenAmount: number; token: string, usdAmount: number, roundTokenAmount: number }[] = [];
    for (const vote of votes) {
      const tokenPrice = prices[vote.token.toLowerCase()];
      if (tokenPrice > 0) {
        // convert to number
        const tokenAmount = Number(formatUnits(vote.amount, 'ether'));
        const usdAmount = tokenAmount * tokenPrice;
        // get the round token amount
        const roundTokenAmount = usdAmount / prices[metadata.token.toLowerCase()];
        votesConverted.push({
          tokenAmount: tokenAmount,
          token: vote.token,
          usdAmount: usdAmount,
          roundTokenAmount: roundTokenAmount
        });

        //   const tokenAmount = vote.amount.div(tokenPrice);
        //   votesConverted.push({ tokenAmount: tokenAmount, token: vote.token, usdAmount: vote.amount });

      }
    }
    projectVotesGroupedByTokenConvertedToUSD[projectRegistryId] = votesConverted;
  }

  // console.log(projectVotesGroupedByTokenConvertedToUSD)

  // reduce the projectVotesGroupedByTokenConvertedToUSD to a {totalUSDAmount: Number, totalRoundTokenAmount}[] for each project
  const projectVotesGroupedByTokenConvertedToUSDSummed: {
    [projectRegistryId: string]: { totalUSDAmount: number, totalRoundTokenAmount: number, sumOfSquares: number, matchAmountInUSD: number };
  } = {};

  for (const projectRegistryId in projectVotesGroupedByTokenConvertedToUSD) {
    const votes = projectVotesGroupedByTokenConvertedToUSD[projectRegistryId];
    const uniqueProjectVoters: string[] = [];

    let totalUSDAmount = 0;
    let totalRoundTokenAmount = 0;
    let sumOfSquares = 0;
    for (const vote of votes) {
      totalUSDAmount += vote.usdAmount;
      totalRoundTokenAmount += vote.roundTokenAmount;
      sumOfSquares += Math.sqrt(vote.usdAmount);
    }
    const matchInUSD = Math.pow(sumOfSquares, 2) - totalUSDAmount;
    projectVotesGroupedByTokenConvertedToUSDSummed[projectRegistryId] = {
      totalUSDAmount: totalUSDAmount,
      totalRoundTokenAmount: totalRoundTokenAmount,
      sumOfSquares: sumOfSquares,
      matchAmountInUSD: matchInUSD
    };

  }

  console.log(projectVotesGroupedByTokenConvertedToUSDSummed)

  // calculate the match amount using our mappings
  const projectMatchAmounts: {
    [projectRegistryId: string]: { matchAmount: number, matchAmountUSD: number };
  } = {};
  // for ()

  // console.log(projectVotesGroupedByTokenConvertedToUSDSummed)

  // let contributionTokens: string[] = [];

  // // group contributions by
  // for (const contribution of contributions) {
  //   let { projectId, amount, token, from, to, version } = contribution;
  //   if (version === "0.1.0") {
  //     projectId = to;
  //   }
  //   // console.log("contribution", contribution);
  //
  //   if (!contributionTokens.includes(token)) {
  //     contributionTokens.push(token);
  //   }
  //
  //   if (!contributionsById[projectId]) {
  //     contributionsById[projectId] = {
  //       contributions: contribution ? { [from]: contribution } : {},
  //     };
  //   }
  //
  //   if (!contributionsById[projectId].contributions[from]) {
  //     contributionsById[projectId].contributions[from] = {
  //       ...contribution,
  //     };
  //   } else {
  //     contributionsById[projectId].contributions[from].amount =
  //       amount.add(amount);
  //   }
  // }

  // console.log("contributionsById", contributionsById);

  // const prices: any = await fetchAverageTokenPrices(
  //   chainId,
  //   contributionTokens,
  //   roundStartTime,
  //   roundEndTime
  // );
  //
  // const matchResults: QFDistribution[] = [];
  // let totalMatchInUSD = 0;
  // // // TODO: rework this to use both project id and or to address for identifiers
  // for (const id in contributionsById) {
  //   const project = contributionsById[id];
  //   console.log("project", project);
  //   let sumOfSquares = 0;
  //   let sumOfContributions = 0;
  //
  //   const uniqueContributors = new Set();
  //
  //   const contributions: QFContribution[] = Object.values(contributionsById[id].contributions);
  //   contributions.forEach(contribution => {
  //       const { amount, token, contributor } = contribution;
  //
  //       uniqueContributors.add(contributor);
  //
  //       // If token is not in prices list, skip it -- LOOK INTO THIS
  //       if (prices[token] > 0) {
  //         const convertedAmount = Number(formatUnits(amount)) * prices[token];
  //         sumOfSquares += Math.sqrt(convertedAmount);
  //         sumOfContributions += convertedAmount;
  //       }
  //     }
  //   );
  //
  //   const matchInUSD = Math.pow(sumOfSquares, 2) - sumOfContributions;
  //
  //   // const projectPayoutAddress = pdata.filter((p: any) => p.id.toLowerCase() === id)[0].payoutAddress;
  //   // const projectPayoutAddress = "";
  //
  //   // const projectPayoutAddress = projectIdToPayoutMapping.get(projectId)!;
  //
  //   matchResults.push({
  //     projectId: id,
  //     matchAmountInUSD: matchInUSD,
  //     totalContributionsInUSD: sumOfContributions,
  //     matchPoolPercentage: 0, // init to zero
  //     matchAmountInToken: 0,
  //     projectPayoutAddress: "",
  //     uniqueContributorsCount: uniqueContributors.size,
  //   });
  //   totalMatchInUSD += isNaN(matchInUSD) ? 0 : matchInUSD; // TODO: what should happen when matchInUSD is NaN?
  //   // TODO: Error out if NaN
  // }
  // console.log({matchResults, totalMatchInUSD})
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
    distribution: [],//matchResults,
    isSaturated: false,//isSaturated,
  };
};
