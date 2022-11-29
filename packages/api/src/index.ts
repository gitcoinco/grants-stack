import * as aws from "@pulumi/aws";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as yup from "yup";
import { ChainId, Results } from "../types";
import { fetchRoundMetadata, handleResponse} from "./utils";
import { db, queryDatabase, vpc } from "./database/db";
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
  const body: { chainId: ChainId; roundId: string } = ev.body
    ? JSON.parse(Buffer.from(ev.body, "base64").toString("utf-8"))
    : null;

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
    await schema.validate(body);
  } catch (err: any) {
    return handleResponse(400, err.errors[0]);
  }

  let results: Results | undefined;

  try {
    // fetch metadata
    const metadata = await fetchRoundMetadata(body.chainId, body.roundId);

    const { id: votingStrategyId, strategyName } = metadata.votingStrategy;

    // decide which handlers to invoke based on voting strategy name
    switch (strategyName) {
      case "quadraticFunding":
        const votes = await linearQFFetchVotes(body.chainId, votingStrategyId);
        results = await linearQFCalculate(metadata, votes);
        break;
    }
  } catch {
    // TODO: handle specific error cases
    return handleResponse(500, "Something went wrong!");
  }

  return handleResponse(200, "Calculations ran successfully", results);
};

export const calculate = new aws.lambda.CallbackFunction<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
>("calculate", { callback: calculateHandler });


const testHandler = async () => {

    const test = await queryDatabase();

    return handleResponse(200, "DB works",{ output: test} );
}


export const test = new aws.lambda.CallbackFunction<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
>("test", {
  vpcConfig: {
    securityGroupIds: db.vpcSecurityGroupIds,
    subnetIds: vpc.privateSubnetIds,
  },
  policies: [
    aws.iam.ManagedPolicies.AWSLambdaVPCAccessExecutionRole,
    aws.iam.ManagedPolicies.AmazonRDSFullAccess,
  ],
  callback: testHandler
});