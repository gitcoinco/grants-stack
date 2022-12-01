import {
  QFContribution,
  QFContributionsByProjectId,
  ProjectMatch,
  RoundMetadata,
  ChainId,
} from "../types";
import { fetchFromGraphQL } from "../utils";

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param votingStrategyId - The voting strategy address
 * @returns The result of the query
 */
export const fetchVotesHandler = async (
  chainId: ChainId,
  votingStrategyId: string
): Promise<QFContribution[]> => {
  const variables = { votingStrategyId };

  const query = `
    query GetVotes($votingStrategyId: String) {
      votingStrategies(where:{
        id: $votingStrategyId
      }) {
        votes {
          amount
          token
          from
          to
        }
      }
    }
  `;

  // fetch from graphql
  const response = await fetchFromGraphQL(chainId, query, variables);

  const votes = response.data?.votingStrategies[0]?.votes;

  let contributions: QFContribution[] = [];

  votes.map((vote: any) => {
    const contribution = {
      projectId: vote.to, // TODO: we will have to update this to project id eventually
      contributor: vote.from,
      amount: Number(vote.amount),
      token: vote.token,
    };

    contributions.push(contribution);
  });

  return contributions;
};

export const calculateHandler = async (
  metadata: RoundMetadata,
  contributions: QFContribution[]
) => {
  const totalProjectPoolAmount = metadata.totalPot;

  // boolean determining the satisfaction of the quadratic funding amount constraint
  let hasSaturated = false;

  // the total amount of contributions per vote
  let totalMatch = 0;

  const contributionsByProjectId: QFContributionsByProjectId = {};
  const projectMatchDistributions: ProjectMatch[] = [];

  const contributionAddresses: Set<string> = new Set();

  // group contributions by projectId
  contributions.forEach((contribution: QFContribution) => {
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
      ].amount += contribution.amount;
    }
  });

  // calculate the linear quadratic funding for each project
  Object.values(contributionsByProjectId).forEach((project) => {
    let sumOfSqrtContrib = 0;
    let sumOfContrib = 0;
    Object.values(project.contributions).forEach((contribution) => {
      sumOfSqrtContrib += Math.sqrt(contribution.amount);
      sumOfContrib += contribution.amount;
    });

    const match = Math.pow(sumOfSqrtContrib, 2) - sumOfContrib;
    projectMatchDistributions.push({
      projectId:
        project.contributions[Object.keys(project.contributions)[0]].projectId,
      amount: match,
      token: "0xffftest", // TODO: Tie in Token Address
      roundId: 0 // TODO: Tie in the round ID
    } as ProjectMatch);
    totalMatch += match;
  });

  if (totalMatch > totalProjectPoolAmount) {
    hasSaturated = true;
  }

  // normalize the match distributions
  if (hasSaturated) {
    // calculate the ratio of the total match to the total project pool amount
    const ratio = totalProjectPoolAmount / totalMatch;
    // calculate the match distribution based on the ratio
    projectMatchDistributions.forEach((projectMatch) => {
      projectMatch.amount *= ratio;
    });
  }

  // TODO: Save into DB

  return {
    distribution: projectMatchDistributions,
    hasSaturated: hasSaturated,
  };
};
