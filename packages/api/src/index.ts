import * as aws from "@pulumi/aws";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ChainId, Results } from "../types";
import { fetchRoundMetadata } from "./utils";
import {
  fetchVotesHandler as linearQFFetchVotes,
  calculateHandler as linearQFCalculate,
} from "./votingStrategies/linearQuadraticFunding";

/**
 * Orchestrator function which invokes calculate
 */
export const calculateHandler = async (
  ev: APIGatewayProxyEvent,
  ctx: aws.lambda.Context
) => {
  // fetch chainId and roundId from post body
  const { chainId, roundId }: { chainId: ChainId; roundId: string } = ev.body
    ? JSON.parse(Buffer.from(ev.body, "base64").toString("utf-8"))
    : null;

  let results: Results | undefined;

  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  const { id: votingStrategyId, strategyName } = metadata.votingStrategy;

  // decide which handlers to invoke based on voting strategy name
  switch (strategyName) {
    case "quadraticFunding":
      const votes = await linearQFFetchVotes(chainId, votingStrategyId);
      results = await linearQFCalculate(metadata, votes);
      break;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};

export const calculate = new aws.lambda.CallbackFunction<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
>("calculate", { callback: calculateHandler });
