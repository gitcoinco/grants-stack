// import * as aws from "@pulumi/aws";
// import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as yup from "yup";
import { CalculateParam, ChainId, Results } from "../types";
import { fetchRoundMetadata, handleResponse} from "./utils";
// import { db, queryDatabase, vpc } from "./database/db";
import {
  fetchVotesHandler as linearQFFetchVotes,
  calculateHandler as linearQFCalculate,
} from "./votingStrategies/linearQuadraticFunding";
import { PrismaClient } from "@prisma/client";

/**
 * Orchestrator function which invokes calculate
 */
export const calculateHandler = async (body: CalculateParam) => {

  // Prisma 
  const prisma = new PrismaClient();

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
  let payout: any; 

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
    return handleResponse(500, "Something went wrong with the calculation!");
  }
  
  if (results && results.distribution.length > 0) {
    // save the distribution results to the db
    payout = await prisma.payout.createMany({
      data: results.distribution
    });
  } else {
    // TODO: handle specific error cases
    return handleResponse(500, "Something went wrong with saving the distribution!");
  }

  return handleResponse(200, "Calculations ran successfully", payout);

};

// Fetch all distributions in the db
export const getAllHandler = async () => {

  const prisma = new PrismaClient();
  const allDists = await prisma.payout.findMany({});

  return handleResponse(200, "All distributions:", allDists);

};

// export const calculate = new aws.lambda.CallbackFunction<
//   APIGatewayProxyEvent,
//   APIGatewayProxyResult
// >("calculate", { callback: calculateHandler });


// const testHandler = async () => {

//     const test = await queryDatabase();

//     return handleResponse(200, "DB works",{ output: test} );
// }


// export const test = new aws.lambda.CallbackFunction<
//   APIGatewayProxyEvent,
//   APIGatewayProxyResult
// >("test", {
//   vpcConfig: {
//     securityGroupIds: db.vpcSecurityGroupIds,
//     subnetIds: vpc.privateSubnetIds,
//   },
//   policies: [
//     aws.iam.ManagedPolicies.AWSLambdaVPCAccessExecutionRole,
//     aws.iam.ManagedPolicies.AmazonRDSFullAccess,
//   ],
//   callback: testHandler
// });
