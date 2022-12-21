import {Request, Response} from "express";
import {
  handleResponse,
} from "../utils";
import {PrismaClient} from "@prisma/client";
import {cache} from "../middleware/cacheMiddleware";

const prisma = new PrismaClient();

export const getRoundSummaryDataHandler = async (req: Request, res: Response) => {
  const {chainId, roundId} = req.params;

  // check if params are valid
  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId or roundId"
    );
  }

  // if not in cache, fetch summary from database whose roundId and projectId match
  const summary = await prisma.roundSummary.findUnique({
    where: {
      roundId: roundId,
    }
  });

  cache.set(`${req.originalUrl}`, summary);

  // if match is not in database, return error
  if (!summary) {
    return handleResponse(res, 404, "error: summary data not found");
  }

  // if match is in database, return match
  return handleResponse(res, 200, `${req.originalUrl}`, summary);
};