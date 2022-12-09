import { handleResponse } from "../utils";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Handles fetching round matches
 *
 * @param req : Request
 * @param res : Response
 */
 export const fetchMatchingHandler = async (req: Request, res: Response) => {
  let results;

  try {
    if (!req.query.roundId) return handleResponse(res , 400, "error: missing parameter roundId", results);
    const roundId = req.query.roundId.toString();
    
    // optional parameter
    const projectId = req.query.projectId?.toString();

    const round = await prisma.round.findFirst({
      where: {
        roundId: roundId,
      },
    });

    if (roundId && round) {
      if (projectId) {
        // fetch matches for a given project in the round
        results = await prisma.payout.findFirst({
          where: {
            roundId: round.id,
            projectId: projectId,
          },
        });
      } else {
        // fetch matches for all projects in the round
        results = await prisma.payout.findMany({
          where: {
            roundId: round.id,
          },
        });
      }
    }
  } catch (err) {
   return handleResponse(res, 500, err as string);
  }

  return handleResponse(res, 200, "fetched info sucessfully", results);
};
