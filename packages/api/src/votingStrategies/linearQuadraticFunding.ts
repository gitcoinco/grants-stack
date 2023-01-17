import { BigNumber } from "ethers";
import { formatUnits, getAddress } from "ethers/lib/utils";
import {
  ChainId,
  QFContributionSummary,
  QFContribution,
  MetaPtr,
  QFVotedEvent,
  QFDistribution,
  RoundMetadata,
  QFDistributionResults,
} from "../types";
import {
  fetchFromGraphQL,
  fetchCurrentTokenPrices,
  fetchPayoutAddressToProjectIdMapping,
  fetchAverageTokenPrices,
  fetchProjectIdToPayoutAddressMapping,
} from "../utils";

/**
 * summarizeRound is an async function that summarizes a round of voting by counting the number of contributions, the number of unique contributors, the total amount of contributions in USD, and the average contribution in USD.
 *
 * @param {ChainId} chainId - The id of the chain to fetch token prices from.
 * @param {RoundMetadata} roundMetadata - An object containing metadata about the round, including the start and end times and the token being voted on.
 * @param {QFContribution[]} contributions - An array of QFContribution objects representing the contributions made in the round.
 * @return {Promise<QFContributionSummary>} - An object containing the summarized data for the round.
 */
export const summarizeQFContributions = async (
  chainId: ChainId,
  contributions: QFContribution[]
): Promise<QFContributionSummary> => {
  // Create an object to store the sums
  const summary: QFContributionSummary = {
    contributionCount: 0,
    uniqueContributors: 0,
    totalContributionsInUSD: 0,
    averageUSDContribution: 0,
  };

  if (contributions.length == 0) {
    return summary;
  }

  const summaryContributions: any = {
    contributions: {},
    contributors: [],
  };

  // Iterate over the array of objects
  contributions.forEach((item: QFContribution) => {
    // Get the token
    const token = item.token;
    const contributor = item.contributor;

    // Initialize the sum for the token if it doesn't exist
    if (!summaryContributions.contributions[token]) {
      summaryContributions.contributions[token] = BigNumber.from("0");
    }

    // Initialize the contributor if it doesn't exist
    if (!summaryContributions.contributors.includes(contributor)) {
      summaryContributions.contributors.push(contributor);
    }
    // Update the sum for the token
    summaryContributions.contributions[token] =
      summaryContributions.contributions[token].add(item.amount);
  });

  let totalContributionsInUSD = 0;

  const prices = await fetchCurrentTokenPrices(
    chainId,
    Object.keys(summaryContributions.contributions)
  );

  Object.keys(summaryContributions.contributions).map(async (tokenAddress) => {
    const tokenAmount: number = Number(
      formatUnits(summaryContributions.contributions[tokenAddress])
    );

    const conversionRate = prices[tokenAddress]?.usd;

    const amountInUSD = tokenAmount * conversionRate;
    totalContributionsInUSD += amountInUSD ? amountInUSD : 0;

    return;
  });

  summary.totalContributionsInUSD = totalContributionsInUSD;
  summary.contributionCount = contributions.length;
  summary.uniqueContributors = summaryContributions.contributors.length;
  summary.averageUSDContribution =
    Number(summary.totalContributionsInUSD) / summary.uniqueContributors;

  return summary;
};

/**
 * fetchContributionsForRound is an async function that retrieves a
 * list of all votes made in a round identified by
 * the votingStrategyId parameter.
 * The function uses pagination to retrieve all votes from the GraphQL API and returns them as an array of QFContribution objects.
 *
 * @param {ChainId} chainId - The id of the chain to fetch the votes from.
 * @param {string} votingStrategyId - The id of the voting strategy to retrieve votes for.
 * @return {Promise<QFContribution[]>} - An array of QFContribution objects representing the votes made in the specified round.
 */
export const fetchQFContributionsForRound = async (
  chainId: ChainId,
  votingStrategyId: string
): Promise<QFContribution[]> => {
  let lastID: string = "";
  const query = `
    query GetContributionsForRound($votingStrategyId: String) {
      votingStrategies(where:{
        id: $votingStrategyId
      }) {
        votes(first: 1000) {
          id
          amount
          token
          from
          to
        }
        round {
          roundStartTime
          roundEndTime
          token
          projectsMetaPtr {
            pointer
            protocol
          }
        }

      }

    }
  `;
  const variables = { votingStrategyId };
  // fetch from graphql
  const response = await fetchFromGraphQL(chainId, query, variables);

  // fetch projectId -> payoutAddress mapping
  const projectsMetaPtr: MetaPtr =
    response.data?.votingStrategies[0]?.round.projectsMetaPtr;
  const projectPayoutToIdMapping = await fetchPayoutAddressToProjectIdMapping(
    projectsMetaPtr
  );

  const votes: QFContribution[] = [];

  response.data?.votingStrategies[0]?.votes.map((vote: QFVotedEvent) => {
    const payoutAddress = getAddress(vote.to);

    // TODO: remove update to projectID after contract upgrade
    const projectId = projectPayoutToIdMapping.get(payoutAddress);

    if (projectId && payoutAddress) {
      votes.push({
        amount: BigNumber.from(vote.amount),
        token: vote.token,
        contributor: vote.from,
        projectId: projectId,
        projectPayoutAddress: payoutAddress,
      });
    } else {
      // DEBUG - keep disabled unless debugging because its not async
      // console.error(
      //   "vote has invalid project 'id' or payout 'to' address",
      //   vote
      // );
    }
    lastID = vote.id;
  });

  while (true) {
    const query = `
      query GetContributionsForRound($votingStrategyId: String, $lastID: String) {
        votingStrategies(where:{
          id: $votingStrategyId
        }) {
          votes(first: 1000, where: {
              id_gt: $lastID
          }) {
            id
            amount
            token
            from
            to
          }
          round {
            roundStartTime
            roundEndTime
            token
          }
        }
      }
    `;

    // Fetch the next page of results from the GraphQL API
    const response = await fetchFromGraphQL(chainId, query, {
      votingStrategyId,
      lastID,
    });

    // Check if the votes field is empty. If it is, stop paginating
    if (response.data?.votingStrategies[0]?.votes.length === 0) {
      break;
    }

    // Add the new votes to the list of votes
    response.data?.votingStrategies[0]?.votes.map((vote: QFVotedEvent) => {
      const payoutAddress = getAddress(vote.to);

      // TODO: remove update to projectID after contract upgrade
      const projectId = projectPayoutToIdMapping.get(payoutAddress);

      if (projectId && payoutAddress) {
        votes.push({
          amount: BigNumber.from(vote.amount),
          token: vote.token,
          contributor: vote.from,
          projectId: projectId,
          projectPayoutAddress: payoutAddress,
        });
      } else {
        // DEBUG - keep disabled unless debugging because its not async
        // console.error(
        //   "vote has invalid project 'id' or payout 'to' address",
        //   vote
        // );
      }
      lastID = vote.id;
    });
  }

  return votes;
};

/**
 * fetchContributionsForProject is a function that fetches a list of contributions for
 * a given project from a GraphQL API.
 *
 * @param {ChainId} chainId - The ID of the chain to fetch data from.
 * @param {string} votingStrategyId - The ID of the voting strategy to fetch data for.
 * @param {string[]} projectIds - An array of project IDs to filter the contributions by.
 * @returns {Promise<QFContribution[]>} A promise that resolves to an array of QFContribution objects.
 */
export const fetchQFContributionsForProjects = async (
  chainId: ChainId,
  votingStrategyId: string,
  projectIds: string[]
): Promise<QFContribution[]> => {
  let lastID: string = "";
  const query = `
    query GetContributionsForProject($votingStrategyId: String, $projectIds: [String]) {
      votingStrategies(where:{
        id: $votingStrategyId
      }) {
        votes(first: 1000, where: {
          to_in: $projectIds
        }) {
          id
          amount
          token
          from
          to
        }
        round {
          roundStartTime
          roundEndTime
          token
          projectsMetaPtr {
            pointer
            protocol
          }
        }

      }

    }
  `;
  const variables = { votingStrategyId, projectIds };
  // fetch from graphql
  const response = await fetchFromGraphQL(chainId, query, variables);

  // fetch projectId -> payoutAddress mapping
  const projectsMetaPtr: MetaPtr =
    response.data?.votingStrategies[0]?.round.projectsMetaPtr;
  const projectPayoutToIdMapping = await fetchPayoutAddressToProjectIdMapping(
    projectsMetaPtr
  );

  const votes: QFContribution[] = [];

  response.data?.votingStrategies[0]?.votes.map((vote: QFVotedEvent) => {
    const payoutAddress = getAddress(vote.to);

    // TODO: remove update to projectID after contract upgrade
    const projectId = projectPayoutToIdMapping.get(payoutAddress);

    votes.push({
      amount: BigNumber.from(vote.amount),
      token: vote.token,
      contributor: vote.from,
      projectId: projectId!,
      projectPayoutAddress: payoutAddress,
    });

    lastID = vote.id;
  });

  while (true) {
    const query = `
      query GetContributionsForProject($votingStrategyId: String, $lastID: String, $projectIds: [String]) {
        votingStrategies(where:{
          id: $votingStrategyId
        }) {
          votes(first: 1000, where: {
              id_gt: $lastID
              to_in: $projectIds
          }) {
            id
            amount
            token
            from
            to
          }
          round {
            roundStartTime
            roundEndTime
            token
          }
        }
      }
    `;

    // Fetch the next page of results from the GraphQL API
    const response = await fetchFromGraphQL(chainId, query, {
      votingStrategyId,
      lastID,
      projectIds,
    });

    // Check if the votes field is empty. If it is, stop paginating
    if (response.data?.votingStrategies[0]?.votes.length === 0) {
      break;
    }

    // Add the new votes to the list of votes
    response.data?.votingStrategies[0]?.votes.map((vote: QFVotedEvent) => {
      const payoutAddress = getAddress(vote.to);

      // TODO: remove update to projectID after contract upgrade
      const projectId = projectPayoutToIdMapping.get(payoutAddress);

      votes.push({
        amount: BigNumber.from(vote.amount),
        token: vote.token,
        contributor: vote.from,
        projectId: projectId!,
        projectPayoutAddress: payoutAddress,
      });
      lastID = vote.id;
    });
  }

  return votes;
};

/**
 *
 * @param {ChainId} chainId  - The ID of the chain on which the round is running
 * @param {RoundMetadata} metadata - Round Metadata
 * @param {QFContribution[]} contributions - Contributions made to the round
 * @returns
 */
export const matchQFContributions = async (
  chainId: ChainId,
  metadata: RoundMetadata,
  contributions: QFContribution[]
): Promise<QFDistributionResults> => {
  const {
    totalPot,
    roundStartTime,
    roundEndTime,
    token,
    matchingCapPercentage,
  } = metadata;

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
      contributionsByProject[projectId].contributions[contributor].usdValue +=
        Number(formatUnits(amount)) * prices[token];
    }
  }

  let matchResults: QFDistribution[] = [];
  let totalMatchInUSD = 0;
  for (const projectId in contributionsByProject) {
    let sumOfSquares = 0;
    let sumOfContributions = 0;

    const uniqueContributors = new Set();

    const contributions: QFContribution[] = Object.values(
      contributionsByProject[projectId].contributions
    );
    contributions.forEach((contribution) => {
      const { contributor, usdValue } = contribution;

      uniqueContributors.add(contributor);

      if (usdValue) {
        sumOfSquares += Math.sqrt(usdValue);
        sumOfContributions += usdValue;
      }
    });

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
    // update matching data
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

  const totalPotInUSD = totalPot * potTokenPrice[token];

  isSaturated = totalMatchInUSD > totalPotInUSD;

  if (isSaturated) {
    let totalMatchInUSDAfterNormalising = 0;

    // If match exceeds pot, scale down match to pot size
    matchResults.forEach((result) => {
      const updatedMatchAmountInUSD =
        result.matchAmountInUSD * (totalPotInUSD / totalMatchInUSD);

      // update matching data
      result.matchAmountInUSD = updatedMatchAmountInUSD;
      result.matchPoolPercentage = result.matchAmountInUSD / totalPotInUSD;
      result.matchAmountInToken = result.matchPoolPercentage * totalPot;

      totalMatchInUSDAfterNormalising += updatedMatchAmountInUSD;
    });

    if (matchingCapPercentage) {
      const matchingCapInUSD = (totalPotInUSD * matchingCapPercentage) / 100;

      console.log("=========== BEFORE CAPPING ===========");
      console.log("matchingCapPercentage", matchingCapPercentage);
      console.log("matchingCapInUSD", matchingCapInUSD);

      console.log("totalMatchInUSD", totalMatchInUSD);
      console.log(
        "totalMatchInUSDAfterNormalising",
        totalMatchInUSDAfterNormalising
      );

      console.log("totalPot", totalPot);
      console.log("totalPotInUSD", totalPotInUSD);

      console.log("=====================");
      matchResults.forEach((match, index) => {
        console.log(
          "Before capping. project: ",
          index,
          "matchAmountInUSD:",
          match.matchAmountInUSD
        );
      });
      console.log("=====================");

      matchResults = applyMatchingCap(
        matchResults,
        totalPot,
        totalMatchInUSDAfterNormalising,
        matchingCapInUSD
      );

      console.log("=========== AFTER CAPPING =========== ");
      let _totalMatchAmountInUSD = 0;
      let _totalMatchAmountInToken = 0;
      let _totalMatchAmountInPercentage = 0;
      matchResults.forEach((result) => {
        _totalMatchAmountInUSD += result.matchAmountInUSD;
        _totalMatchAmountInToken += result.matchAmountInToken;
        _totalMatchAmountInPercentage += result.matchPoolPercentage;
      });
      console.log("_totalMatchAmountInUSD", _totalMatchAmountInUSD);
      console.log("_totalMatchAmountInToken", _totalMatchAmountInToken);
      console.log(
        "_totalMatchAmountInPercentage",
        _totalMatchAmountInPercentage
      );

      console.log("=====================");
      matchResults.forEach((match, index) => {
        console.log(
          "After capping. project: ",
          index,
          "matchAmountInUSD:",
          match.matchAmountInUSD
        );
      });
      console.log("=====================");
    }
  }

  return {
    distribution: matchResults,
    isSaturated: isSaturated,
  };
};

/**
 * Apply matching cap if project match is greater than the cap.
 *
 * @param distribution
 * @param totalPot
 * @param totalMatchInUSD
 * @param matchingCap
 */
const applyMatchingCap = (
  distribution: QFDistribution[],
  totalPot: number,
  totalMatchInUSD: number,
  matchingCapInUSD: number
): QFDistribution[] => {
  if (matchingCapInUSD == 0) return distribution;

  let amountLeftInPoolAfterCapping = 0;
  let totalMatchForProjectWhichHaveNotCapped = 0;

  distribution.forEach((projectMatch) => {
    if (projectMatch.matchAmountInUSD >= matchingCapInUSD) {
      // increase amountLeftInPoolAfterCapping by the amount that is over the cap
      const amountOverCap = projectMatch.matchAmountInUSD - matchingCapInUSD;
      amountLeftInPoolAfterCapping += amountOverCap;

      // update matching data
      // update projectMatch to capped amount
      projectMatch.matchAmountInUSD = matchingCapInUSD;
      projectMatch.matchPoolPercentage =
        projectMatch.matchAmountInUSD / totalMatchInUSD;
      projectMatch.matchAmountInToken =
        projectMatch.matchPoolPercentage * totalPot;
    } else {
      // track project matches which have not been capped
      totalMatchForProjectWhichHaveNotCapped += projectMatch.matchAmountInUSD;
    }
  });

  // If there is any amount left in the pool after capping ->
  // Distribute it proportionally to the projects which have not been capped
  if (
    amountLeftInPoolAfterCapping > 0 &&
    totalMatchForProjectWhichHaveNotCapped > 0
  ) {
    const reminderPercentage =
      amountLeftInPoolAfterCapping / totalMatchForProjectWhichHaveNotCapped;

    // reset amountLeftInPoolAfterCapping to check if any project's match is more the capAmount after spreading the remainder
    amountLeftInPoolAfterCapping = 0;

    distribution.forEach((projectMatch) => {
      if (projectMatch.matchAmountInUSD < matchingCapInUSD) {
        // distribute the remainder proportionally to the projects which have not been capped
        projectMatch.matchAmountInUSD +=
          projectMatch.matchAmountInUSD * reminderPercentage;
        projectMatch.matchPoolPercentage =
          projectMatch.matchAmountInUSD / totalMatchInUSD;
        projectMatch.matchAmountInToken =
          projectMatch.matchPoolPercentage * totalPot;

        // check if the project's match is more the capAmount after spreading the remainder
        if (projectMatch.matchAmountInToken < matchingCapInUSD) {
          // increase amountLeftInPoolAfterCapping by the amount that is over the cap
          const amountOverCap =
            projectMatch.matchAmountInUSD - matchingCapInUSD;
          amountLeftInPoolAfterCapping += amountOverCap;
        }

        // apply the cap again (recursively)
        if (amountLeftInPoolAfterCapping > 0) {
          applyMatchingCap(
            distribution,
            totalPot,
            totalMatchInUSD,
            matchingCapInUSD
          );
        }
      }
    });
  }

  return distribution;
};
