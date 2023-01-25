import { Request, Response } from "express";
import { handleResponse } from "../utils";
import { cache } from "../cacheConfig";
import { db } from "../database";

export const getProjectSummaryDataHandler = async (
  req: Request,
  res: Response
) => {
  let { chainId, roundId, projectId } = req.params;

  // check if params are valid
  if (!chainId || !roundId || !projectId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId, roundId, or projectId"
    );
  }
  try {
    roundId = roundId.toLowerCase();
    projectId = projectId.toLowerCase();
    const summary = await db.getProjectSummaryRecord(roundId, projectId);
    if (summary.error) {
      throw summary.error;
    }

    // if match is not in database, return error
    if (!summary.result) {
      return handleResponse(res, 404, "error: summary data not found");
    }

    cache.set(`${req.originalUrl}`, summary.result);

    return handleResponse(res, 200, `${req.originalUrl}`, summary.result);
  } catch (error) {
    console.error("getProjectSummaryDataHandler", error);
    return handleResponse(res, 500, "error: something went wrong");
  }
};
