import { fetchGraphQFContributionsForRound, fetchGraphVotingStrategies } from "../src/utils";
import { ChainId, GraphQFVotes, GraphResponse, GraphVotingStrategies } from "../src/types";
import { VotingStrategy } from "@prisma/client";
import { DatabaseInstance } from "../src/database";

async function main() {

  // TODO: all the other chains
  // TODO: Check version and if < 0.2.0, use alt method to get project id
  // TODO: Figure out whats up with the graph

  // Database instance
  const db = new DatabaseInstance();

  // Ethereum Mainnet Voting Strategies
  const ethMainnetVotingStrategiesResponse: GraphResponse<GraphVotingStrategies> =
    await fetchGraphVotingStrategies(ChainId.MAINNET);
  const ethMainnetVotingStrategies = ethMainnetVotingStrategiesResponse.data.votingStrategies;

  // Get the contributions for each voting strategy
  for (const votingStrategy of ethMainnetVotingStrategies) {
    const contributions: GraphResponse<GraphQFVotes> =
      await fetchGraphQFContributionsForRound(ChainId.MAINNET, votingStrategy.id);
    // TODO: db error handling
    db.createVoteRecords(ChainId.MAINNET, votingStrategy.strategyName as VotingStrategy, contributions);
  }

}

// TODO: handle connection and disconnections
main().then(() => console.log("done"));
