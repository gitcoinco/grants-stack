import {Request, Response} from "express";
import {
  handleResponse,
} from "../utils";
import {cache} from "../cacheConfig";
import {db} from "../database";

export const getRoundMatchDataHandler = async (req: Request, res: Response) => {
  const {chainId, roundId} = req.params;

  // check if params are valid
  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId, roundId, or projectId"
    );
  }

  try {

    const match = await db.getRoundMatchRecord(roundId);

    cache.set(`${req.originalUrl}`, match);

    // if match is not in database, return error
    if (!match) {
      return handleResponse(res, 404, "error: match not found");
    }

    // if match is in database, return match
    return handleResponse(res, 200, `${req.originalUrl}`, match);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "error: something went wrong");
  }
};