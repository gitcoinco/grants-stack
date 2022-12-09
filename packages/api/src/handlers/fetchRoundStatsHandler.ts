import { fetchRoundMetadata, getChainVerbose, handleResponse } from "../utils";
import {
  fetchVotesHandler as linearQFFetchVotes,
  fetchRoundStatsHandler as linearQFFetchRoundStats,
} from "../votingStrategies/linearQuadraticFunding";
import { Request, Response, Send } from "express";
import { ChainId } from "../types";


export const fetchRoundStatsHandler = async (req: Request, res: Response): Promise<Response> => {
  
  let results;

  try {
    
    // validate parameters
    if (!req.query.roundId) return handleResponse(res , 400, "error: missing parameter roundId", results);
    const roundId = req.query.roundId.toString();
      
    if (!req.query.chainId) return handleResponse(res , 400, "error: missing parameter chainId", results);
    const chainId = req.query.chainId as ChainId;

    // fetch metadata
    const metadata = await fetchRoundMetadata(chainId, roundId);
    
    const { id: votingStrategyId, strategyName } = metadata.votingStrategy;
    
    // handle how stats should be derived per voting strategy
    switch (strategyName) {
      case "LINEAR_QUADRATIC_FUNDING":
        // fetch all votes
        const votes = await linearQFFetchVotes(chainId, votingStrategyId);
        // fetch round stats
        results =  await linearQFFetchRoundStats(chainId, votes, metadata);
        break;
      default:        
        return handleResponse(res, 400, "error: unsupported voting strategy");
    }
    
  } catch (err) {    
    // TODO: LOG ERROR TO SENTRY
    // console.error(err);
    return handleResponse(res, 500, "error: something went wrong.");
  }

  return handleResponse(res, 200, "fetched round stats successfully", results);
}
