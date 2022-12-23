import {Request, Response} from "express";
import {
  handleResponse,
} from "../utils";
import {cache} from "../cacheConfig";
import {db} from "../database";

export const getProjectSummaryDataHandler = async (req: Request, res: Response) => {
  const {chainId, roundId, projectId} = req.params;

  // check if params are valid
  if (!chainId || !roundId || !projectId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId, roundId, or projectId"
    );
  }
  try {

    const summary = await db.getProjectSummaryRecord(roundId, projectId);

    cache.set(`${req.originalUrl}`, summary);

    // if match is not in database, return error
    if (!summary) {
      return handleResponse(res, 404, "error: summary data not found");
    }

    return handleResponse(res, 200, `${req.originalUrl}`, summary);

  } catch (error) {
    console.error("getProjectSummaryDataHandler", error);
    return handleResponse(res, 500, "error: something went wrong");
  }

};