import { Request, Response } from "express";
import {
  fetchFromGraphQL,
  fetchRoundMetadata,
  getChainVerbose,
  handleResponse,
} from "../utils";
import { ChainId, QFDistributionResults } from "../types";
import { differenceInMinutes, isAfter, isWithinInterval } from "date-fns";
import { VotingStrategy } from "@prisma/client";
import {
  fetchQFContributionsForRound,
  matchQFContributions,
} from "../votingStrategies/linearQuadraticFunding";
import { hotfixForRounds } from "../hotfixes";
import { db } from "../database";

/** Updates the matching data for all rounds */
export const updateAllRoundMatchesHandler = async (
  req: Request,
  res: Response
) => {
  let body = req.body;

  /* Authenticate that the request is being called from cron-job (or by whoever has the secret API key), reject otherwise */
  let api_key = process.env.CRON_JOB_API_KEY;
  if (api_key !== body.apiKey) {
    return handleResponse(res, 401, "apiKey is missing or invalid");
  }

  /* Iterate over all chains */
  let chainIds = [
    ChainId.MAINNET,
    ChainId.OPTIMISM_MAINNET,
    ChainId.FANTOM_MAINNET,
  ];

  try {
    let chainPromises = await Promise.all(
      chainIds.map(async (chainId) => {
        /* Get all programs */
        let programs: {
          data: {
            programs: {
              metaPtr: {
                pointer: string;
              };
              rounds: {
                id: string;
                roundMetaPrt: {
                  pointer: string;
                };
                roundStartTime: string;
                roundEndTime: string;
              }[];
            }[];
          };
        } = await fetchFromGraphQL(
          chainId,
          `{
                programs {
                  metaPtr {
                    pointer
                  }
                  rounds {
                    id
                    roundMetaPtr {
                      pointer
                    }
                    roundEndTime
                    roundStartTime
                  }
                }
             }`
        );

        /* only take those that have at least one round */
        let rounds = programs.data.programs
          .filter((program) => program.rounds.length > 0)
          .map((program) => program.rounds)
          .flat();

        /* Pick rounds that are active */
        let activeRounds = rounds.filter((round) => {
          let roundActiveInterval = {
            start: new Date(Number(round.roundStartTime) * 1000),
            end: new Date(Number(round.roundEndTime) * 1000),
          };

          return isWithinInterval(new Date(), roundActiveInterval);
        });

        /* or that have ended less than one hour ago */
        let recentlyClosedRounds = rounds.filter(
          (round) =>
            isAfter(new Date(), new Date(round.roundEndTime)) &&
            differenceInMinutes(new Date(), new Date(round.roundEndTime)) <= 60
        );

        /* Call the update matching functions for each eligible round */
        let eligibleRounds = [...activeRounds, ...recentlyClosedRounds];

        /* Return the rounds that have been updated */
        return await Promise.all(
          eligibleRounds.map((round) => updateRoundMatching(chainId, round.id))
        );
      })
    );
    return handleResponse(
      res,
      200,
      "rounds updated",
      JSON.stringify(chainPromises)
    );
  } catch (e) {
    return handleResponse(res, 500, JSON.stringify(e));
  }
};

async function updateRoundMatching(chainId: ChainId, roundIdArg: string) {
  let results: QFDistributionResults | undefined;
  const roundId = roundIdArg.toLowerCase();
  const metadata = await fetchRoundMetadata(chainId as ChainId, roundId);
  const { votingStrategy } = metadata;
  const votingStrategyName = votingStrategy.strategyName as VotingStrategy;
  const chainIdVerbose = getChainVerbose(chainId);

  switch (votingStrategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      let contributions = await fetchQFContributionsForRound(
        chainId,
        votingStrategy.id
      );

      contributions = await hotfixForRounds(roundId, contributions);

      results = await matchQFContributions(
        chainId as ChainId,
        metadata,
        contributions
      );
      break;
  }
  if (!results) {
    throw "error: no results";
  }

  const upsertRecordStatus = await db.upsertRoundRecord(
    roundId,
    {
      isSaturated: results.isSaturated,
    },
    {
      chainId: chainIdVerbose,
      roundId: roundId,
      votingStrategyName: votingStrategyName,
      isSaturated: results.isSaturated,
    }
  );

  if (upsertRecordStatus.error) {
    throw upsertRecordStatus.error;
  }

  // save the distribution results to the db
  for (const projectMatch of results.distribution) {
    const upsertMatchStatus = await db.upsertProjectMatchRecord(
      chainId,
      roundId,
      metadata,
      projectMatch
    );
    if (upsertRecordStatus.error) {
      throw upsertMatchStatus.error;
    }
  }

  const match = await db.getRoundMatchRecord(roundId);

  if (match.error) {
    throw match.error;
  }

  return match.result;
}
