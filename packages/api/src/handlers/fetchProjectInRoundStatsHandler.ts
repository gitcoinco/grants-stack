import { fetchRoundMetadata, getStrategyName, handleResponse } from "../utils";
import {
  fetchVotesForProjectInRoundHandler as linearQFFetchVotesForProjectInRound,
  fetchStatsHandler as linearQFFetchRoundStats,
} from "../votingStrategies/linearQuadraticFunding";
import { Request, Response } from "express";
import { ChainId } from "../types";

export const fetchProjectInRoundStatsHandler = async (
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

    if (!req.query.projectId)
      return handleResponse(
        res,
        400,
        "error: missing parameter projectId",
        results
      );
    const projectId = req.query.projectId.toString();

    // fetch metadata
    const metadata = await fetchRoundMetadata(chainId, roundId);

    let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

    strategyName = getStrategyName(strategyName);

    // handle how stats should be derived per voting strategy
    switch (strategyName) {
      case "LINEAR_QUADRATIC_FUNDING":
        // fetch votes
        const votes = await linearQFFetchVotesForProjectInRound(
          chainId,
          votingStrategyId,
          projectId
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
    // const serializedError = JSON.stringify(err, Object.getOwnPropertyNames(err));
    return handleResponse(res, 500, "error: something went wrong.");
  }

  return handleResponse(
    res,
    200,
    "fetched project in round stats successfully",
    results
  );
};
