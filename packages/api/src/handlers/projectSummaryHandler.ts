import {
  ChainId,
  QFVote,
} from "../types";
import {
  fetchFromGraphQL,
  fetchRoundMetadata,
  getStrategyName,
  handleResponse, summarizeQFVotes,
} from "../utils";
import { Request, Response } from "express";
import { BigNumber } from "ethers";

/**
 * projectSummaryHandler is a function that handles HTTP requests for summary information for a given round and project.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response that will be sent.
 * @returns {void}
 */
export const projectSummaryHandler = async (req: Request, res: Response) => {
  const {chainId, roundId, projectId} = req.params;

  if (!chainId || !roundId || !projectId) {
    handleResponse(res, 400, "error: missing parameter chainId, roundId, or projectId");
  }

  try {
    const results = await getProjectsSummary(chainId as ChainId, roundId, [projectId]);

    return handleResponse(res, 200, "fetched project summary successfully", results);
  } catch (err) {
    return handleResponse(res, 500, "error: something went wrong");
  }
};

/**
 * getProjectsSummary is a function that fetches metadata and summary information for a given round and set of projects from a GraphQL API.
 *
 * @param {ChainId} chainId - The ID of the chain to fetch data from.
 * @param {string} roundId - The ID of the round to fetch data for.
 * @param {string[]} projectIds - An array of project IDs to filter the summary data by.
 * @returns {Promise<any>} A promise that resolves to an array of objects containing the summary data.
 */
export const getProjectsSummary = async (chainId: ChainId, roundId: string, projectIds: string[]): Promise<any> => {
  let results: any = [];
  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

  strategyName = getStrategyName(strategyName);

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch votes
      const votes = await fetchContributionsForProject(chainId, votingStrategyId, projectIds);
      // fetch round stats
      results =  await summarizeQFVotes(chainId, metadata, votes);
      break;
    default:
      throw("error: unsupported voting strategy");
  }

  return results;
}

/**
 * fetchContributionsForProject is a function that fetches a list of contributions for a given project from a GraphQL API.
 *
 * @param {ChainId} chainId - The ID of the chain to fetch data from.
 * @param {string} votingStrategyId - The ID of the voting strategy to fetch data for.
 * @param {string[]} projectIds - An array of project IDs to filter the contributions by.
 * @returns {Promise<QFVote[]>} A promise that resolves to an array of QFVote objects.
 */
export const fetchContributionsForProject = async (
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

