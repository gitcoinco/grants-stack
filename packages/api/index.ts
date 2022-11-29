
import * as apigateway from "@pulumi/aws-apigateway";
import { calculate, test } from "./src/index";

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
// $ pulumi logs -f