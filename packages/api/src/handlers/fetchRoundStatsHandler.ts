import { fetchRoundMetadata, getStrategyName, handleResponse } from "../utils";
import {
  fetchVotesForRoundHandler as linearQFFetchVotesForRound,
  fetchStatsHandler as linearQFFetchRoundStats,
} from "../votingStrategies/linearQuadraticFunding";
import { Request, Response } from "express";
import { ChainId, QFContribution } from "../types";
import { fetchFromGraphQL } from "../utils";

export const fetchRoundStatsHandler = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let results;

  try {
    // validate parameters
    if (!req.query.roundId)
      return handleResponse(
        res,
        400,
        "error: missing parameter roundId",
        results
      );
    const roundId = req.query.roundId.toString();

    if (!req.query.chainId)
      return handleResponse(
        res,
        400,
        "error: missing parameter chainId",
        results
      );
    const chainId = req.query.chainId as ChainId;

    // fetch metadata
    const metadata = await fetchRoundMetadata(chainId, roundId);

    let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

    strategyName = getStrategyName(strategyName);

    /* Fetch all projects belonging to the round */
    const roundProjectRes = await fetchFromGraphQL(
      chainId,
      `query GetApprovedProjects($roundId:String!) {
        round(id: $roundId) {
          projects(where: {status: "APPROVED"}) {
            id
            payoutAddress
          }
        }
      }`,
      {
        roundId,
      }
    );


    // handle how stats should be derived per voting strategy
    switch (strategyName) {
      case "LINEAR_QUADRATIC_FUNDING":
        const roundProjects = roundProjectRes.data.round.projects;
        const projectStats = [];

        // fetch votes
        const votes = await linearQFFetchVotesForRound(
          chainId,
          votingStrategyId
        );

        for (let i = 0; i < roundProjects.length; i++) {
          const projectVotes: QFContribution[] = [];

          votes.forEach((vote) => {
            if (
              vote.projectId.toLowerCase() ===
              roundProjects[i].payoutAddress.toLowerCase()
            ) {
              projectVotes.push(vote);
            }
          });

          // fetch round stats
          let resultForProject = await linearQFFetchRoundStats(
            chainId,
            projectVotes,
            metadata
          );
          projectStats.push({
            ...resultForProject,
            projectId: roundProjects[i].payoutAddress,
          });
        }

        return handleResponse(res, 200, "success", projectStats);
      default:
        return handleResponse(res, 400, "error: unsupported voting strategy");
    }
  } catch (err) {
    // TODO: LOG ERROR TO SENTRY
    // console.error(err);
    // serialize javascript error to json
    const serializedError = JSON.stringify(
      err,
      Object.getOwnPropertyNames(err)
    );
    return handleResponse(res, 500, serializedError);
  }
};
