import * as aws from "@pulumi/aws";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Results } from "../types";
import { ChainId, fetchMetadataByVotingStrategyId, getGraphQLEndpoint } from "./utils";
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
  
  // TODO: Get chain ID and votingStrategyId from POST body
  const chainId = "5" as ChainId;
  const votingStrategyId = "0x1a497d28890efb320d04f534fa6318b6a0657619";

  let results;
  
  // fetch metadata
  // const metadata = await fetchMetadataByVotingStrategyId(chainId, votingStrategyId);

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