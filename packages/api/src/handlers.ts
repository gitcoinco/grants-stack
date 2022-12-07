import * as yup from "yup";
import { Request, Response } from "express";
import { ChainId, ChainName, Results } from "./types";
import {
  fetchRoundMetadata,
  getChainVerbose,
  getPriceForToken,
  handleResponse,
} from "./utils";
import {
  fetchVotesHandler as linearQFFetchVotes,
  calculateHandler as linearQFCalculate,
} from "./votingStrategies/linearQuadraticFunding";
import { PrismaClient, VotingStrategy } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Orchestrator function which invokes calculate
 *
 * @param req : Request
 * @param res : Response
 */
export const calculateHandler = async (req: Request, res: Response) => {
  // validate request body
  const schema = yup.object().shape({
    chainId: yup.mixed<ChainId>().oneOf(Object.values(ChainId)).required(),
    roundId: yup
      .string()
      .required()
      .matches(
        /^0x[a-fA-F0-9]{40}$/,
        "roundId must be an ethereum contract address"
      ),
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    return handleResponse(res, 400, err.errors[0]);
  }

  let results: Results | undefined;

  try {
    const roundId = req.body.roundId;

    // fetch metadata
    const metadata = await fetchRoundMetadata(req.body.chainId, roundId);

    const { id: votingStrategyId, strategyName } = metadata.votingStrategy;

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
        const votes = await linearQFFetchVotes(
          req.body.chainId,
          votingStrategyId
        );
        results = await linearQFCalculate(metadata, votes, req.body.chainId);
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
    return handleResponse(res, 500, err as string);
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
    handleResponse(res, 500, err as string);
  }

  handleResponse(res, 200, "fetched info sucessfully", results);
};

const convertPriceRequestSchema = yup.object().shape({
  contract: yup.string().required(),
  chain: yup.string().required(),
});

/**
 * Converts between crypto and fiat prices
 */
export const convertPriceHandler = async (
  req: Request<any, any, { contract: string; chain: ChainName }>,
  res: Response
) => {
  try {
    await convertPriceRequestSchema.validate(req.body);
  } catch (err: any) {
    return handleResponse(res, 400, err.errors);
  }

  try {
    let result = await getPriceForToken(req.body.contract, req.body.chain);
    handleResponse(res, 200, "fetched info sucessfully", result);
  } catch (err) {
    handleResponse(res, 500, err as string); // FIXME: this won't work because error cannot be serialized
    // (its properties arent enumerable)
    // so we either need a custom error message or bear the rist of leaking things when
    // we override the serialization block
  }
};
