
import * as apigateway from "@pulumi/aws-apigateway";
import { calculate, test } from "./src/index";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import {db, vpc} from "./src/utils";



// Create a Lambda within the VPC to access the Aurora DB and run the code above.
const lambda = new aws.lambda.CallbackFunction("lambda", {
  vpcConfig: {
    securityGroupIds: db.vpcSecurityGroupIds,
    subnetIds: vpc.privateSubnetIds,
  },
  policies: [
    aws.iam.ManagedPolicies.AWSLambdaVPCAccessExecutionRole,
    // aws.iam.ManagedPolicies.AWSLambdaFullAccess,
    aws.iam.ManagedPolicies.AmazonRDSFullAccess,
  ],
  callback: async(ev) => {
    console.log(ev);

    // await queryDatabase();
  },
});

// Export the Function ARN
export const functionArn = lambda.arn;

// A REST API to route requests to HTML content and the Lambda function
const api = new apigateway.RestAPI("api", {
  routes: [
    { path: "/", method: "GET", eventHandler: test },
    { path: "/calculate", method: "POST", eventHandler: calculate },
  ]
});

// The URL at which the REST API will be served.
export const url = api.url;

// Invoke this with:
// $ aws lambda invoke --function-name $(pulumi stack output functionArn) out.txt
// $ pulumi logs -f