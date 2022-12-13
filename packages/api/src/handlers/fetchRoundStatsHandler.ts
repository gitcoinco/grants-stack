import { fetchRoundMetadata, handleResponse } from "../utils";
import {
  fetchVotesForRoundHandler as linearQFFetchVotesForRound,
  fetchStatsHandler as linearQFFetchRoundStats,
} from "../votingStrategies/linearQuadraticFunding";
import { Request, Response } from "express";
import { ChainId } from "../types";
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

    const { id: votingStrategyId, strategyName } = metadata.votingStrategy;

    /* Fetch all projects belonging to the round */
    const roundProjectRes = await fetchFromGraphQL(
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

    const roundProjects = roundProjectRes.data.round.projects;

    // console.log(roundProjects);

    // handle how stats should be derived per voting strategy
    switch (strategyName) {
      case "LINEAR_QUADRATIC_FUNDING":
        // fetch votes
        const votes = await linearQFFetchVotesForRound(
          chainId,
          votingStrategyId
        );
        // fetch round stats
        results = await linearQFFetchRoundStats(chainId, votes, metadata);
        break;
      default:
        return handleResponse(res, 400, "error: unsupported voting strategy");
    }
  } catch (err) {
    // TODO: LOG ERROR TO SENTRY
    // console.error(err);
    // serialize javascript error to json
    const serializedError = JSON.stringify(err, Object.getOwnPropertyNames(err));
    return handleResponse(res, 500, serializedError);
  }

  return handleResponse(res, 200, "fetched round stats successfully", results);
};
