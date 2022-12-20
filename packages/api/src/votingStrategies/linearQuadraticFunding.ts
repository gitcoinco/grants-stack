import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import {
  ChainId,
  QFContributionSummary,
  QFContribution,
} from "../types";
import {
  fetchFromGraphQL,
  fetchCurrentTokenPrices,
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
    totalContributionsInUSD: "0",
    averageUSDContribution: "0",
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

  summary.totalContributionsInUSD = totalContributionsInUSD.toString();
  summary.contributionCount = contributions.length;
  summary.uniqueContributors = summaryContributions.contributors.length;
  summary.averageUSDContribution = (
    Number(summary.totalContributionsInUSD) / summary.uniqueContributors
  ).toString();

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
        }

      }

    }
  `;
  const variables = { votingStrategyId };
  // fetch from graphql
  const response = await fetchFromGraphQL(chainId, query, variables);

  const votes: QFContribution[] = [];

  response.data?.votingStrategies[0]?.votes.map((vote: any) => {
    votes.push({
      amount: BigNumber.from(vote.amount),
      token: vote.token,
      contributor: vote.from,
      projectId: vote.to, // TODO: update to projectID after contract upgrade
    });
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
    response.data?.votingStrategies[0]?.votes.map((vote: any) => {
      votes.push({
        amount: BigNumber.from(vote.amount),
        token: vote.token,
        contributor: vote.from,
        projectId: vote.to, // TODO: update to projectID after contract upgrade
      });
      lastID = vote.id;
    });
  }

  return votes;
};

/**
 * fetchContributionsForProject is a function that fetches a list of contributions for a given project from a GraphQL API.
 *
 * @param {ChainId} chainId - The ID of the chain to fetch data from.
 * @param {string} votingStrategyId - The ID of the voting strategy to fetch data for.
 * @param {string[]} projectIds - An array of project IDs to filter the contributions by.
 * @returns {Promise<QFContribution[]>} A promise that resolves to an array of QFContribution objects.
 */
export const fetchQFContributionsForProjects = async (
  chainId: ChainId,
  votingStrategyId: string,
  projectIds: string[],
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
        }

      }

    }
  `;
  const variables = { votingStrategyId, projectIds };
  // fetch from graphql
  const response = await fetchFromGraphQL(chainId, query, variables);

  const votes: QFContribution[] = [];

  response.data?.votingStrategies[0]?.votes.map((vote: any) => {
    votes.push({
      amount: BigNumber.from(vote.amount),
      token: vote.token,
      contributor: vote.from,
      projectId: vote.to, // TODO: update to projectID after contract upgrade
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
    response.data?.votingStrategies[0]?.votes.map((vote: any) => {
      votes.push({
        amount: BigNumber.from(vote.amount),
        token: vote.token,
        contributor: vote.from,
        projectId: vote.to, // TODO: update to projectID after contract upgrade
      });
      lastID = vote.id;
    });
  }

  return votes;
};

