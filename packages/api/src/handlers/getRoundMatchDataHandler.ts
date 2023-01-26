import { Request, Response } from "express";
import { handleResponse } from "../utils";
import { cache } from "../cacheConfig";
import { db } from "../database";

export const getRoundMatchDataHandler = async (req: Request, res: Response) => {
  let { chainId, roundId } = req.params;

  // check if params are valid
  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId, roundId, or projectId"
    );
  }

  try {
    roundId = roundId.toLowerCase();
    const match = await db.getRoundMatchRecord(roundId);
    if (match.error) {
      throw match.error;
    }

    // if match is not in database, return error
    if (match.result.length < 1) {
      return handleResponse(res, 404, "error: match not found");
    }

    cache.set(`${req.originalUrl}`, match.result);

    // if match is in database, return match
    return handleResponse(res, 200, `${req.originalUrl}`, match.result);
  } catch (error) {
    console.error("getRoundMatchDataHandler", error);
    return handleResponse(res, 500, "error: something went wrong");
  }
};
