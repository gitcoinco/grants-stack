import { Request, Response } from "express";
import { handleResponse } from "../utils";
import { db } from "../database";

export const getProjectSummariesDataHandler = async (
  req: Request,
  res: Response
) => {
  try {
    let { roundId } = req.params;
    const { projectIdsReq } = req.query;

    roundId = roundId.toLowerCase();
    let projectIds = String(projectIdsReq).split(",");
    projectIds = projectIds.map((projectId) => projectId.toLowerCase());

    const projects = await db.getProjectSummaryRecordsByIds(
      roundId,
      projectIds
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
