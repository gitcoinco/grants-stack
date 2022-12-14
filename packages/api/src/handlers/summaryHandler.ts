import { ChainId, ProjectSummary, QFContribution } from "../types";
import { fetchFromGraphQL, fetchRoundMetadata, handleResponse } from "../utils";
import {
  fetchStatsHandler as linearQFFetchRoundStats,
  fetchVotesForRoundHandler as linearQFFetchVotesForRound
} from "../votingStrategies/linearQuadraticFunding";
import {Request, Response} from "express";

export const summaryHandler = async (req: Request, res: Response) => {
  const { chainId, roundId } = req.params;
  const { projectId } = req.query;

  if (!chainId || !roundId) {
    handleResponse(res, 400, "error: missing parameter chainId or roundId");
  }
  if (projectId) {
    const projectIds: string[] = projectId.toString().split(",");

    // fetch project summaries
    try {
      const results = await getProjectsSummary(chainId as ChainId, roundId, projectIds);
      return handleResponse(res, 200, "fetched project in round stats successfully", results);
    } catch (err) {
      return handleResponse(res, 500, "error: something went wrong.");
    }

  } else {
    // fetch round stats
    try {
      const results = await getRoundSummary(chainId as ChainId, roundId);
      console.log("here");
      return handleResponse(res, 200, "fetched round stats successfully", results);
    } catch (err) {
      return handleResponse(res, 500, "error: something went wrong", err);
    }
  }
}

export const getRoundSummary = async (chainId: ChainId, roundId: string): Promise<any> => {
  let results;

  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  const { id: votingStrategyId, strategyName } = metadata.votingStrategy;

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch votes
      const votes = await linearQFFetchVotesForRound(chainId, votingStrategyId);
      // fetch round stats
      results =  await linearQFFetchRoundStats(chainId, votes, metadata);
      break;
    default:
      throw("error: unsupported voting strategy");
  }

  return results;
}

export const getProjectsSummary = async (chainId: ChainId, roundId: string, projectIds: string[]): Promise<any> => {
  let results: any = [];
  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);
  // console.log(metadata)
  const { id: votingStrategyId, strategyName } = metadata.votingStrategy;
  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch votes
      const votes = await fetchVotesForProjects(chainId, votingStrategyId, projectIds);
      // fetch round stats
      results =  await summarizeProjects(chainId, votes);
      break;
    default:
      throw("error: unsupported voting strategy");
  }

  return results;
}

export const summarizeProjects = async (
  chainId: ChainId,
  contributions: QFContribution[],
): Promise<ProjectSummary> => {

  // Create an object to store the sums
  const summary: any = {};

  // Iterate over the array of objects
  contributions.forEach((item: QFContribution) => {
    // Get the project ID and token
    const projectId = item.projectId;
    const token = item.token;
    const contributor = item.contributor;


    // Initialize the object for the project ID if it doesn't exist
    if (!summary[projectId]) {
      summary[projectId] = {} as ProjectSummary;
      summary[projectId].contributions = {};
      summary[projectId].contributors = [];
    }

    // Initialize the sum for the token if it doesn't exist
    if (!summary[projectId].contributions[token]) {
      summary[projectId].contributions[token] = 0;
    }
    // Initialize the contributor if it doesn't exist
    if (!summary[projectId].contributors.includes(contributor)) {
      summary[projectId].contributors.push(contributor);
    }

    // Update the sum for the token
    summary[projectId].contributions[token] += item.amount;

  });

  // Return the sums object
  return summary;
}

export const fetchVotesForProjects = async (
  chainId: ChainId,
  votingStrategyId: string,
  projectIds: string[]
): Promise<QFContribution[]> => {
  const variables = { votingStrategyId, projectIds };

  // query and filter votes for a project by id
  const query = `
      query GetVotesForProjectsInRound($votingStrategyId: String, $projectIds: [String!]) {
      votingStrategies(where: {
        id: $votingStrategyId
      }) {
        votes(where: {
          to_in: $projectIds
        }) {
          votingStrategy 
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



