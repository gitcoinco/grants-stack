import { fetchRoundMetadata, getStrategyName, handleResponse } from "../utils";
import {
  fetchVotesForRoundHandler as linearQFFetchVotesForRound,
  fetchStatsHandler as linearQFFetchRoundStats,
  groupStatsByProject,
} from "../votingStrategies/linearQuadraticFunding";
import { Request, Response } from "express";
import { ChainId, QFContribution, RoundProject, RoundMetadata, ProjectStats } from "../types";
import { fetchFromGraphQL } from "../utils";

export const fetchRoundStatsHandler = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let results;

  try {
    // validate parameters
    if (!req.query.roundId)
      return handleResponse(
        res,
        400,
        "error: missing parameter roundId",
        results
      );
    const roundId = req.query.roundId.toString();

    if (!req.query.chainId)
      return handleResponse(
        res,
        400,
        "error: missing parameter chainId",
        results
      );
    const chainId = req.query.chainId as ChainId;

    // fetch metadata
    const metadata = await fetchRoundMetadata(chainId, roundId);

    let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

    strategyName = getStrategyName(strategyName);

    /* Fetch all projects belonging to the round */
    const approvedProjects = await fetchApprovedProjects(chainId, roundId);

    // handle how stats should be derived per voting strategy
    switch (strategyName) {
      case "LINEAR_QUADRATIC_FUNDING":

        // fetch votes
        const votes = await linearQFFetchVotesForRound(
          chainId,
          votingStrategyId
        );

        const projectStats = await groupStatsByProject(approvedProjects, votes, chainId, metadata);

        return handleResponse(res, 200, "success", projectStats);
      default:
        return handleResponse(res, 400, "error: unsupported voting strategy");
    }
  } catch (err) {
    // TODO: LOG ERROR TO SENTRY
    const serializedError = JSON.stringify(err, Object.getOwnPropertyNames(err));
    console.error(serializedError);

    return handleResponse(res, 500, "error: something went wrong");
  }
};

/**
 * Fetches list of approved projects
 *
 * @param chainId string
 * @param roundId string
 * @returns RoundProject[]
 */
const fetchApprovedProjects = async (chainId: ChainId, roundId: string): Promise<RoundProject[]> => {

  // TODO: UPDATE LOGIC TO FETCH FROM CONTRACT
  try {
    // TODO: UPDATE L104 from payoutAddress to projectId
    /* Fetch all projects belonging to the round */
    const results = await fetchFromGraphQL(
      chainId,
      `query GetApprovedProjects($roundId:String!) {
        round(id: $roundId) {
          projects(where: {status: "APPROVED"}) {
            id
            payoutAddress
          }
        }
      }`,
      {
        roundId,
      }
    );

    return results.data.round.projects;
  } catch (err) {
    // LOG TO SENTRY
    console.error(err);
    return [];
  }
}

