import {Request, Response} from "express";
import {
  handleResponse,
} from "../utils";
import {PrismaClient} from "@prisma/client";
import {cache} from "../cacheConfig";

const prisma = new PrismaClient();

export const getRoundMatchDataHandler = async (req: Request, res: Response) => {
  const {chainId, roundId} = req.params;

  // check if params are valid
  if (!chainId || !roundId) {
    return handleResponse(
      res,
      400,
      "error: missing parameter chainId, roundId, or projectId"
    );
  }

  try {
    // get round to check if saturated
    const round = await prisma.round.findUnique({
      where: {
        roundId: roundId,
      },
      // include only the fields we need
      select: {
        isSaturated: true,
      }
    });

    // if not in cache, fetch match from database
    const match = await prisma.match.findMany({
      where: {
        roundId: roundId,
      },
    });

    cache.set(`${req.originalUrl}`, match);

    // if match is not in database, return error
    if (!match) {
      return handleResponse(res, 404, "error: match not found");
    }

    // if match is in database, return match
    return handleResponse(res, 200, `${req.originalUrl}`, match);
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, "error: something went wrong");
  }
};