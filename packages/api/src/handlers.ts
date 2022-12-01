import * as yup from "yup";
import { Request, Response } from "express";
import { ChainId, Results } from "./types";
import { fetchRoundMetadata, handleResponse } from "./utils";
import {
  fetchVotesHandler as linearQFFetchVotes,
  calculateHandler as linearQFCalculate,
} from "./votingStrategies/linearQuadraticFunding";
import { PrismaClient } from "@prisma/client";

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
    const metadata = await fetchRoundMetadata(req.body.chainId, req.body.roundId);

    const { id: votingStrategyId, strategyName } = metadata.votingStrategy;

    // decide which handlers to invoke based on voting strategy name
    switch (strategyName) {
      case "quadraticFunding":
        const votes = await linearQFFetchVotes(req.body.chainId, votingStrategyId);
        results = await linearQFCalculate(metadata, votes);
        break;
    }
  } catch {
    // TODO: handle specific error cases
    handleResponse(res, 500, "Something went wrong with the calculation!");
  }

  if (results && results.distribution.length > 0) {
    // save the distribution results to the db
    payout = await prisma.payout.createMany({
      data: results.distribution,
    });
  } else {
    // TODO: handle specific error cases
    handleResponse(
      res,
      500,
      "Something went wrong with saving the distribution!"
    );
  }

  handleResponse(res, 200, "Calculations ran successfully", payout);
};

// Fetch all distributions in the db
export const getAllHandler = async (req: Request, res: Response) => {
  const allDists = await prisma.payout.findMany({});

  handleResponse(res, 200, "All distributions:", allDists);
};
