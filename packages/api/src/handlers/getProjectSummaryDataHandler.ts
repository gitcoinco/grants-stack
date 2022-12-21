import {Request, Response} from "express";
import {
  handleResponse,
} from "../utils";
import {PrismaClient} from "@prisma/client";
import {cache} from "../cacheConfig";

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
    const prisma = new PrismaClient();
    // if not in cache, fetch summary from database whose roundId and projectId match
    const summary = await prisma.projectSummary.findUnique({
      where: {
        projectId: projectId,
      },
    });

    cache.set(`${req.originalUrl}`, summary);

    // if match is not in database, return error
    if (!summary) {
      return handleResponse(res, 404, "error: summary data not found");
    }

    return handleResponse(res, 200, `${req.originalUrl}`, summary);

  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "error: something went wrong");
  }

};