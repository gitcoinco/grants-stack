import { Request, Response } from "express";
import { handleResponse } from "../utils";
import { db } from "../database";

export const getProjectSummariesDataHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { roundId } = req.params;
    const { projectIds } = req.query;

    const projects = await db.getProjectSummaryRecordsByIds(
      roundId,
      String(projectIds).split(",")
    );

    if (projects.error) {
      throw projects.error;
    }

    if (projects.result.length < 1) {
      return handleResponse(res, 404, "project summaries not found");
    }

    return handleResponse(res, 200, `${req.originalUrl}`, projects.result);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "error: something went wrong");
  }
};
