import * as aws from "@pulumi/aws";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Contribution, ContributionsByProjectId, ProjectMatch } from "../../types";

async function calculateHandler(
  ev: APIGatewayProxyEvent,
  ctx: aws.lambda.Context
) {
  const totalProjectPoolAmount = 1000; // TODO: get from the project data

  // boolean determining the satisfaction of the quadratic funding amount constraint
  let hasSaturated = false;

  // the total amount of contributions per vote
  let totalMatch = 0;

  // decode base64-encoded body to contributions
  const contributions: Contribution[] = ev.body
    ? JSON.parse(Buffer.from(ev.body, "base64").toString("utf-8"))
    : null;

  const contributionsByProjectId: ContributionsByProjectId = {};
  const projectMatchDistributions: ProjectMatch[] = [];

  const contributionAddresses: Set<string> = new Set();

  // group contributions by projectId
  contributions.forEach((contribution: Contribution) => {
    if (!contributionsByProjectId[contribution.projectId]) {
      contributionsByProjectId[contribution.projectId] = {
        contributions: contribution
          ? { [contribution.contributor]: contribution }
          : {},
      };
      contributionAddresses.add(contribution.contributor);
    }
    // sum the contributions from the same address
    if (
      !contributionsByProjectId[contribution.projectId].contributions[
        contribution.contributor
      ]
    ) {
      contributionsByProjectId[contribution.projectId].contributions[
        contribution.contributor
      ] = { ...contribution };
    } else {
      contributionsByProjectId[contribution.projectId].contributions[
        contribution.contributor
      ].amount += contribution.amount;
    }
  });

  // calculate the linear quadratic funding for each project
  Object.values(contributionsByProjectId).forEach((project) => {
    let sumOfSqrtContrib = 0;
    let sumOfContrib = 0;
    Object.values(project.contributions).forEach((contribution) => {
      sumOfSqrtContrib += Math.sqrt(contribution.amount);
      sumOfContrib += contribution.amount;
    });

    const match = Math.pow(sumOfSqrtContrib, 2) - sumOfContrib;
    projectMatchDistributions.push({
      projectId:
        project.contributions[Object.keys(project.contributions)[0]].projectId,
      match,
    } as ProjectMatch);
    totalMatch += match;
  });

  if (totalMatch > totalProjectPoolAmount) {
    hasSaturated = true;
  }

  // normalize the match distributions
  if (hasSaturated) {
    // calculate the ratio of the total match to the total project pool amount
    const ratio = totalProjectPoolAmount / totalMatch;
    // calculate the match distribution based on the ratio
    projectMatchDistributions.forEach((projectMatch) => {
      projectMatch.match *= ratio;
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      distribution: projectMatchDistributions,
      hasSaturated: hasSaturated,
    }),
  };
}

export const calculate = new aws.lambda.CallbackFunction<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
>("calculate", { callback: calculateHandler });
