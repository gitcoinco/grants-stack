
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { calculateHandler, getAllHandler } from "./src/index";
import {json} from 'body-parser';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(json());

app.listen(port, () => {
  console.log(`⚡️[server]: running on : ${port}`);
});

app.get('/', (req: Request, res: Response) => {
  res.json({ test : "it works"});
});

app.post('/calculate', async (req: Request, res: Response) => {

  // Get parameters
  const body = req.body;

  // Invoke calculate handler
  const response = await calculateHandler(body);

  res.json(response);
});

app.get('/all', async (req: Request, res: Response) => {
  const response = await getAllHandler(); 
  res.json(response); 
})


// app.post("/calculate/", async (request, response) => {
//   try {
//     const { id } = request.body;
//     console.log("Casting vote for " + id);
//     await pool.query("UPDATE voting_app.choice SET vote_count = vote_count + 1 WHERE choice_id = $1", [
//       id
//     ]);
//     response.json("Vote successfully cast");
//   } catch (error) {
//     console.log(error.message);
//   }
// });

// import * as apigateway from "@pulumi/aws-apigateway";
// import { calculate, test } from "./src/index";

// const express = require("express");
// const app = express();

// // A REST API to route requests to HTML content and the Lambda function
// const api = new apigateway.RestAPI("api", {
//   routes: [
//     { path: "/", method: "GET", eventHandler: test },
//     { path: "/calculate", method: "POST", eventHandler: calculate },
//   ]
// });

// // The URL at which the REST API will be served.
// export const url = api.url;

// Invoke this with:
// $ pulumi logs -f
