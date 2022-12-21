import {
  Results,
} from "../types";
import {Request, Response} from "express";
import {
  handleResponse,
} from "../utils";
import {PrismaClient} from "@prisma/client";
import {cache} from "../middleware/cacheMiddleware";

const prisma = new PrismaClient();

export const getProjectMatchDataHandler = async (req: Request, res: Response) => {
  const {chainId, roundId, projectId} = req.params;

  // check if params are valid
  if (!chainId || !roundId || !projectId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId, roundId, or projectId"
    );
  }

  // check if match is cached
  const cachedRoundMatchData = cache.get(`cache_/data/round/match/${chainId}/${roundId}`) as Results;
  // TODO: also check data round cache
  if (cachedRoundMatchData) {
    const cachedProjectMatch = cachedRoundMatchData.distribution.filter((match: any) => match.projectId === projectId)[0];
    return handleResponse(res, 200, `${req.originalUrl}`, cachedProjectMatch);
  }

  // if not in cache, fetch match from database whose roundId and projectId match
  const match = await prisma.match.findUnique({
    where: {
      projectId: projectId,
    },
  });

  cache.set(`${req.originalUrl}`, match);

  // if match is not in database, return error
  if (!match) {
    return handleResponse(res, 404, "error: match not found");
  }

  // if match is in database, return match
  return handleResponse(res, 200, `${req.originalUrl}`, match);
};
