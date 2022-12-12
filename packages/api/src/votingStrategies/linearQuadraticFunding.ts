import {
  QFContribution,
  QFContributionsByProjectId,
  ProjectMatch,
  RoundMetadata,
  ChainId,
  DenominationResponse,
  ChainName,
  RoundStats,
} from "../types";
import { denominateAs, fetchFromGraphQL } from "../utils";

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

  const query = `
    query GetVotesForRound($votingStrategyId: String) {
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
    } as QFContribution;

    contributions.push(contribution);
  });

  return contributions;
};

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param votingStrategyId - The voting strategy address
 * @param projectId - The projectId taking part in the round
 * @returns The result of the query
 */
export const fetchVotesForProjectInRoundHandler = async (
  chainId: ChainId,
  votingStrategyId: string,
  projectId: string
): Promise<QFContribution[]> => {
  const variables = { votingStrategyId, projectId };

  // TODO: UPDATE LINE 83 from to -> projectId after upgrading subgraph
  const query = `
    query GetVotesForProjectInRound($votingStrategyId: String, projectId: String) {
      votingStrategies(where: {
        id: $votingStrategyId
      }) {
        votes(where: {
          to: $projectId
        }) {
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
    } as QFContribution;

    contributions.push(contribution);
  });

  return contributions;
};

export const calculateHandler = async (
  metadata: RoundMetadata,
  contributions: QFContribution[],
  chainId: ChainId,
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
            ? {[contribution.contributor]: contribution}
            : {},
      };
      contributionAddresses.add(contribution.contributor);
    }
    // denominate the contribution in the round token
    // TODO: look into this logic. When should conversion happen?
    // TODO: Determine how we want to pass any errors. If the conversion is unavailable, then the converted amount will
    //       be the same as the original amount. Is this an error and should it be reported to the user?
    //       The DenominationResponse type is defined in types.ts and includes a message/success field for future use.
    const res: DenominationResponse = await denominateAs(
        contribution.token,
        metadata.token,
        contribution.amount,
        metadata.roundStartTime,
        metadata.roundEndTime,
        chainId
    );
    contribution.amount = res.amount;

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
  }

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
 * Fetch Round Stats for a round using linearQF voting strategy
 * @param chainName - Chain from which round / voting contract is deployed 
 * @param contributions - QFContribution[] fetched by invoking fetchVotesForRoundHandler
 * @param metadata - RoundMetadata fetched by invoking fetchRoundMetadata
 */
export const fetchStatsHandler = async (
  chainId: ChainId,
  contributions: QFContribution[],
  metadata: RoundMetadata
): Promise<RoundStats> => {
  let totalContributionsInUSD = 0;
  let uniqueContributors: string[] = [];

  denominateAs
  contributions.map(async contribution => {
    
    if (!uniqueContributors.includes(contribution.projectId)) {
      uniqueContributors.push(contribution.projectId);
    }

    const contributionInUSD = await denominateAs(
      contribution.token,
      metadata.token, // TODO: HARDCODE TO USDC TOKEN FOR STABLE
      contribution.amount,
      metadata.roundStartTime,
      metadata.roundEndTime,
      chainId
  );

    totalContributionsInUSD += contributionInUSD.amount;
  });

  return {
    uniqueContributorCount: uniqueContributors.length,
    contributionsCount: contributions.length,
    totalContributionsInUSD: totalContributionsInUSD
  };
}