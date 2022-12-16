import * as yup from "yup";
import { Request, Response } from "express";
import { ChainId, ChainName, Results } from "../types";
import {
  fetchRoundMetadata,
  getChainVerbose,
  getPriceForToken,
  getStrategyName,
  handleResponse,
} from "../utils";
import {
  fetchVotesForRoundHandler as linearQFFetchVotesForRound,
  calculateHandler as linearQFCalculate,
} from "../votingStrategies/linearQuadraticFunding";
import { PrismaClient, VotingStrategy } from "@prisma/client";

const prisma = new PrismaClient();

export const calculateRequestSchema = yup.object().shape({
  chainId: yup.mixed<ChainId>().oneOf(Object.values(ChainId)).required(),
  roundId: yup
    .string()
    .required()
    .matches(
      /^0x[a-fA-F0-9]{40}$/,
      "roundId must be an ethereum contract address"
    ),
});

/**
 * Orchestrator function which invokes calculate
 *
 * @param req : Request
 * @param res : Response
 */
export const calculateHandler = async (req: Request, res: Response) => {
  // validate request body

  try {
    await calculateRequestSchema.validate(req.body);
  } catch (err: any) {
    return handleResponse(res, 400, err.errors[0]);
  }

  let results: Results | undefined;

  try {
    const roundId = req.body.roundId;

    // fetch metadata
    const metadata = await fetchRoundMetadata(req.body.chainId, roundId);

    let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

    strategyName = getStrategyName(strategyName);
    
    // create round if round does not exist
    const chainId = getChainVerbose(req.body.chainId);
    const round = await prisma.round.upsert({
      where: {
        roundId: roundId,
      },
      update: {
        chainId,
      },
      create: {
        chainId,
        roundId,
        votingStrategyName: <VotingStrategy>strategyName,
      },
    });

    // decide which handlers to invoke based on voting strategy name
    switch (strategyName) {
      case "LINEAR_QUADRATIC_FUNDING":
        // TODO: replace with fetchQFContributionsForRound
        const contributions = await linearQFFetchVotesForRound(
          req.body.chainId,
          votingStrategyId
        );
        results = await linearQFCalculate(metadata, contributions);
        break;
    }

    if (results) {
      // update result is round saturation has changed
      if (round.isSaturated != results.isSaturated) {
        await prisma.round.update({
          where: { id: round.id },
          data: { isSaturated: results.isSaturated },
        });
      }

      // save the distribution results to the db
      // TODO: figure out if there is a better way to batch transactions
      for (const match of results.distribution) {
        await prisma.payout.upsert({
          where: {
            payoutIdentifier: {
              projectId: match.projectId,
              roundId: round.id,
            },
          },
          update: {
            amount: match.amount,
          },
          create: {
            amount: match.amount,
            token: match.token,
            projectId: match.projectId,
            roundId: round.id,
          },
        });
      }
    }
  } catch (err) {
    return handleResponse(res, 500, (err as any).message);
  }

  return handleResponse(res, 200, "Calculations ran successfully", results);
};

/**
 * Handles fetching round matches
 *
 * @param req : Request
 * @param res : Response
 */
export const fetchMatchingHandler = async (req: Request, res: Response) => {
  let results;

  try {
    const roundId = req.query.roundId?.toString();
    const projectId = req.query.projectId?.toString();

    const round = await prisma.round.findFirst({
      where: {
        roundId: roundId,
      },
    });

    if (roundId && round) {
      if (projectId) {
        results = await prisma.payout.findFirst({
          where: {
            roundId: round.id,
            projectId: projectId,
          },
        });
      } else {
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
