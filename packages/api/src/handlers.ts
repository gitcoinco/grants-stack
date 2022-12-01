import * as yup from "yup";
import { Request, Response } from "express";
import { ChainId, Results } from "./types";
import { fetchRoundMetadata, getChainVerbose, handleResponse } from "./utils";
import {
  fetchVotesHandler as linearQFFetchVotes,
  calculateHandler as linearQFCalculate,
} from "./votingStrategies/linearQuadraticFunding";
import { PrismaClient, VotingStrategy } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Orchestrator function which invokes calculate
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
    handleResponse(res, 400, err.errors[0]);
  }

  let results: Results | undefined;
  let payout: any;

  try {
    // fetch metadata
    const metadata = await fetchRoundMetadata(
      req.body.chainId,
      req.body.roundId
    );

    const { id: votingStrategyId, strategyName } = metadata.votingStrategy;

    // create round if round does not exist
    const chainId = getChainVerbose(req.body.chainId);
    const upsertRound = await prisma.round.upsert({
      where: {
        roundId: req.body.roundId,
      },
      update: {
        chainId,
      },
      create: {
        chainId,
        roundId: req.body.roundId,
        votingStrategyName: <VotingStrategy>strategyName,
      },
    });

    console.log(upsertRound);

    // decide which handlers to invoke based on voting strategy name
    switch (strategyName) {
      case "LINEAR_QUADRATIC_FUNDING":
        const votes = await linearQFFetchVotes(
          req.body.chainId,
          votingStrategyId
        );
        results = await linearQFCalculate(metadata, votes);
        break;
    }

    console.log(results);

    if (results && results.distribution.length > 0) {
      // save the distribution results to the db
      // TODO: figure out a way to do bulk insert
      results.distribution.forEach(async (match) => {
        await prisma.payout.upsert({
          where: {
            payoutIdentifier: {
              projectId: match.projectId,
              roundId: upsertRound.id,
            },
          },
          update: {
            amount: match.amount,
          },
          create: {
            amount: match.amount,
            token: match.token,
            projectId: match.projectId,
            roundId: upsertRound.id,
          },
        });
      });
    }
  } catch (err) {
    handleResponse(res, 500, err as string);
  }

  handleResponse(res, 200, "Calculations ran successfully", results);
  return;
};
