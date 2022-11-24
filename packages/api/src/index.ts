import { ProjectMatch, Results } from "../types";
import { ChainId, fetchMetadataByVotingStrategyId, getGraphQLEndpoint } from "./utils";
import {
  fetchVotesHandler as linearQFFetchVotes,
  calculateHandler as linearQFCalculate
} from "./votingStrategies/linearQuadraticFunding";
/**
 * Orchestrator function which invokes calculate 
 */
export const calculate = async (chainId: ChainId, votingStrategyId: string): Promise<Results> => {
  
  let results;
  
  // fetch metadata
  const metadata = await fetchMetadataByVotingStrategyId(chainId, votingStrategyId);

  // decide which handlers to invoke based on voting strategy name
  switch(metadata.votingStrategyName) {
    case "quadraticFunding":
      const votes = await linearQFFetchVotes(chainId, votingStrategyId);
      results = await linearQFCalculate(metadata, votes);
      break;
  }

  return results;
};