import {Results} from "../types";
import {Request, Response} from "express";
import {
  handleResponse,
} from "../utils";
import {cache} from "../cacheConfig";
import {db} from "../database";

export const getProjectMatchDataHandler = async (req: Request, res: Response) => {
  const {chainId, roundId, projectId} = req.params;

  // check if params are valid
  if (!chainId || !roundId || !projectId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId, roundId, or projectId"
    );
  }

  // check if match is cached
  const cachedRoundMatchData = cache.get(`cache_/data/round/match/${chainId}/${roundId}`) as Results;
  // TODO: also check data round cache
  if (cachedRoundMatchData) {
    const cachedProjectMatch = cachedRoundMatchData.distribution.filter((match) => match.projectId === projectId)[0];
    return handleResponse(res, 200, `${req.originalUrl}`, cachedProjectMatch);
  }

  try {
    const match = await db.getProjectMatchRecord(roundId, projectId);

    cache.set(`${req.originalUrl}`, match);

    // if match is not in database, return error
    if (!match) {
      return handleResponse(res, 404, "error: match not found");
    }

    // if match is in database, return match
    return handleResponse(res, 200, `${req.originalUrl}`, match);
  } catch (error) {
    console.error("getProjectMatchDataHandler", error);
    return handleResponse(res, 500, "error: internal server error");
  }
};
