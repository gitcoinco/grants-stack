import * as aws from "@pulumi/aws";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Results } from "../types";
import { ChainId, fetchRoundMetadata, fetchFromGraphQL, getGraphQLEndpoint } from "./utils";
import {
  fetchVotesHandler as linearQFFetchVotes,
  calculateHandler as linearQFCalculate
} from "./votingStrategies/linearQuadraticFunding";
/**
 * Orchestrator function which invokes calculate 
 */
export const calculateHandler = async (
  ev: APIGatewayProxyEvent,
) => {

  // fetch chainId and roundId from post body
  const {chainId, roundId}: {chainId: ChainId, roundId: string} = ev.body
  ? JSON.parse(Buffer.from(ev.body, "base64").toString("utf-8"))
  : null;

  const votingStrategyId = "0x1a497d28890efb320d04f534fa6318b6a0657619";
  // roundId = 0xcef1772dd6764c95f14c26b25e8f012c072c5f77

  let results;
  
  // fetch metadata
  // const metadata = await fetchRoundMetadata(chainId, roundId);

  // TODO: replace hardcoded with above line
  const metadata = {
    votingStrategyName: "quadraticFunding",
    token: "0x1",
    totalPot: 1000,
  }

  // decide which handlers to invoke based on voting strategy name
  switch(metadata.votingStrategyName) {
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