import { Request, Response } from "express";
import { handleResponse } from "../utils";
import { cache } from "../cacheConfig";
import { db } from "../database";

export const getRoundSummaryDataHandler = async (
  req: Request,
  res: Response
) => {
  let { chainId, roundId } = req.params;

  // check if params are valid
  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId or roundId"
    );
  }

  try {
    roundId = roundId.toLowerCase();
    // if not in cache, fetch summary from database whose roundId and projectId match
    const summary = await db.getRoundSummaryRecord(roundId);
    if (summary.error) {
      throw summary.error;
    }

    // if match is not in database, return error
    if (!summary.result) {
      return handleResponse(res, 404, "summary not found");
    }

    cache.set(`${req.originalUrl}`, summary.result);

    // if match is in database, return match
    return handleResponse(res, 200, `${req.originalUrl}`, summary.result);
  } catch (error) {
    console.error("getRoundSummaryDataHandler", error);
    return handleResponse(res, 500, "error: something went wrong");
  }
};
