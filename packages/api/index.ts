import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";
import { calculate } from "./src/index";

// A Lambda function to invoke
const fn = new aws.lambda.CallbackFunction("fn", {
  callback: async (ev, ctx) => {
    return {
      statusCode: 200,
      body: new Date().toISOString(),
    };
  }
})

// A REST API to route requests to HTML content and the Lambda function
const api = new apigateway.RestAPI("api", {
  routes: [
    { path: "/", method: "GET", eventHandler: fn },
    { path: "/calculate", method: "POST", eventHandler: calculate },
  ]
});

// The URL at which the REST API will be served.
export const url = api.url;