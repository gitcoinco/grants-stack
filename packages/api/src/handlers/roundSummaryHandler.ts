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
 * roundSummaryHandler is a function that handles HTTP requests for summary information for a given round.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The HTTP response that will be sent.
 * @returns {void}
 */
export const roundSummaryHandler = async (req: Request, res: Response) => {
  const { chainId, roundId } = req.params;

  if (!chainId || !roundId) {
    handleResponse(res, 400, "error: missing parameter chainId or roundId");
  }

  try {
    const results = await getRoundSummary(chainId as ChainId, roundId);

    return handleResponse(
      res,
      200,
      "fetched round summary successfully",
      results
    );
  } catch (err) {
    return handleResponse(res, 500, "error: something went wrong", err);
  }
};

/**
 * getRoundSummary is a function that fetches metadata and summary information for a given round from a GraphQL API.
 *
 * @param {ChainId} chainId - The ID of the chain to fetch data from.
 * @param {string} roundId - The ID of the round to fetch data for.
 * @returns {Promise<any>} A promise that resolves to an object containing the summary data for the round.
 */
export const getRoundSummary = async (
  chainId: ChainId,
  roundId: string
): Promise<any> => {
  let results;

  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

  strategyName = getStrategyName(strategyName);

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch votes
      const votes = await fetchContributionsForRound(chainId, votingStrategyId);
      // console.log({votes})
      // fetch round stats
      results = await summarizeQFVotes(chainId, metadata, votes);
      break;
    default:
      throw "error: unsupported voting strategy";
  }

  return results;
};

/**
 * fetchContributionsForRound is an async function that retrieves a list of all votes made in a round identified by the votingStrategyId parameter.
 * The function uses pagination to retrieve all votes from the GraphQL API and returns them as an array of QFVote objects.
 *
 * @param {ChainId} chainId - The id of the chain to fetch the votes from.
 * @param {string} votingStrategyId - The id of the voting strategy to retrieve votes for.
 * @return {Promise<QFVote[]>} - An array of QFVote objects representing the votes made in the specified round.
 */
export const fetchContributionsForRound = async (
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

