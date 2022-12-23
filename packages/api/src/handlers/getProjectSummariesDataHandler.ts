import {Request, Response} from "express";
import {handleResponse} from "../utils";
import {db} from "../database";

export const getProjectSummariesDataHandler = async (req: Request, res: Response) => {
  const {roundId} = req.params;
  const {projectIds} = req.query;

  const projects = await db.getProjectSummaryRecordsByIds(roundId, String(projectIds).split(","));
  return handleResponse(res, 200, 'good', projects);
}