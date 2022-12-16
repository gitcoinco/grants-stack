import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import {
  QFContribution,
  QFContributionsByProjectId,
  ProjectMatch,
  RoundMetadata,
  ChainId,
  QFContributionSummary,
  QFVote,
} from "../types";
import {
  denominateAs,
  fetchFromGraphQL,
  getChainName,
  fetchTokenPrices,
} from "../utils";

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param votingStrategyId - The voting strategy address
 * @returns The result of the query
 */
export const fetchVotesForRoundHandler = async (
  chainId: ChainId,
  votingStrategyId: string
): Promise<QFContribution[]> => {
  const variables = { votingStrategyId };

  // TODO: implement paging here instead of hard-coded limit of 1000
  const query = `
    query GetVotesForRound($votingStrategyId: String) {
      votingStrategies(where:{
        id: $votingStrategyId
      }) {
        votes(first: 1000) {
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

  // fetch from graphql
  const response = await fetchFromGraphQL(chainId, query, variables);

  const votes = response.data?.votingStrategies[0]?.votes ?? [];
  const round = response.data?.votingStrategies[0]?.round;

  let contributions: QFContribution[] = [];

  const { error } = getChainName(chainId);

  if (error) {
    throw new Error(`ChainId ${chainId} is not supported by CoinGecko's API.`);
  }

  contributions = await Promise.all(
    votes.map(async (vote: any) => {
      // denominate the contribution in the round token
      // TODO: look into this logic. When should conversion happen?
      // TODO: Determine how we want to pass any errors. If the conversion is unavailable, then the converted amount will
      //       be the same as the original amount. Is this an error and should it be reported to the user?
      //       The DenominationResponse type is defined in types.ts and includes a message/success field for future use.

      const res = await denominateAs(
        vote.token,
        round.token,
        vote.amount,
        round.roundStartTime,
        round.roundEndTime,
        chainId
      );

      const convertedAmount = res.amount;

      const contribution = {
        projectId: vote.to, // TODO: we will have to update this to project id eventually
        contributor: vote.from,
        amount: Number(vote.amount),
        convertedAmount,
        token: vote.token,
      } as QFContribution;

      return contribution;
    })
  );

  return contributions;
};

export const calculateHandler = async (
  metadata: RoundMetadata,
  contributions: QFContribution[]
) => {
  const totalProjectPoolAmount = metadata.totalPot;

  // boolean determining the satisfaction of the quadratic funding amount constraint
  let isSaturated = false;

  // the total amount of contributions per vote
  let totalMatch = 0;

  const contributionsByProjectId: QFContributionsByProjectId = {};
  const projectMatchDistributions: ProjectMatch[] = [];

  const contributionAddresses: Set<string> = new Set();

  // group contributions by projectId
  for (const contribution of contributions) {
    if (!contributionsByProjectId[contribution.projectId]) {
      contributionsByProjectId[contribution.projectId] = {
        contributions: contribution
          ? { [contribution.contributor]: contribution }
          : {},
      };
      contributionAddresses.add(contribution.contributor);
    }

    // sum the contributions from the same address
    if (
      !contributionsByProjectId[contribution.projectId].contributions[
        contribution.contributor
      ]
    ) {
      contributionsByProjectId[contribution.projectId].contributions[
        contribution.contributor
      ] = { ...contribution };
    } else {
      contributionsByProjectId[contribution.projectId].contributions[
        contribution.contributor
      ].convertedAmount += contribution.convertedAmount;
    }
  }

  // calculate the linear quadratic funding for each project
  Object.values(contributionsByProjectId).forEach((project) => {
    let sumOfSqrtContrib = 0;
    let sumOfContrib = 0;
    Object.values(project.contributions).forEach((contribution) => {
      sumOfSqrtContrib += Math.sqrt(contribution.convertedAmount);
      sumOfContrib += contribution.convertedAmount;
    });

    const match = Math.pow(sumOfSqrtContrib, 2) - sumOfContrib;
    projectMatchDistributions.push({
      projectId:
        project.contributions[Object.keys(project.contributions)[0]].projectId,
      amount: match,
      token: metadata.token,
    } as ProjectMatch);
    totalMatch += match;
  });

  if (totalMatch > totalProjectPoolAmount) {
    isSaturated = true;
  }

  // normalize the match distributions
  if (isSaturated) {
    // calculate the ratio of the total match to the total project pool amount
    const ratio = totalProjectPoolAmount / totalMatch;
    // calculate the match distribution based on the ratio
    projectMatchDistributions.forEach((projectMatch) => {
      projectMatch.amount *= ratio;
    });
  }

  return {
    distribution: projectMatchDistributions,
    isSaturated: isSaturated,
  };
};

/**
 * summarizeRound is an async function that summarizes a round of voting by counting the number of contributions, the number of unique contributors, the total amount of contributions in USD, and the average contribution in USD.
 *
 * @param {ChainId} chainId - The id of the chain to fetch token prices from.
 * @param {RoundMetadata} roundMetadata - An object containing metadata about the round, including the start and end times and the token being voted on.
 * @param {QFVote[]} contributions - An array of QFVote objects representing the contributions made in the round.
 * @return {Promise<QFContributionSummary>} - An object containing the summarized data for the round.
 */
export const summarizeQFContributions = async (
  chainId: ChainId,
  contributions: QFVote[]
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
  contributions.forEach((item: QFVote) => {
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

  const prices = await fetchTokenPrices(
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
 * The function uses pagination to retrieve all votes from the GraphQL API and returns them as an array of QFVote objects.
 *
 * @param {ChainId} chainId - The id of the chain to fetch the votes from.
 * @param {string} votingStrategyId - The id of the voting strategy to retrieve votes for.
 * @return {Promise<QFVote[]>} - An array of QFVote objects representing the votes made in the specified round.
 */
export const fetchQFContributionsForRound = async (
  chainId: ChainId,
  votingStrategyId: string
): Promise<QFVote[]> => {
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

  const votes: QFVote[] = [];

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
 * @returns {Promise<QFVote[]>} A promise that resolves to an array of QFVote objects.
 */
export const fetchQFContributionsForProject = async (
  chainId: ChainId,
  votingStrategyId: string,
  projectIds: string[],
): Promise<QFVote[]> => {
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

  const votes: QFVote[] = [];

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

