import {
  fetchGraphMeta,
  fetchGraphPrograms,
  fetchGraphQFVotes,
  fetchGraphRoundProjects,
  fetchGraphProgramRounds,
  fetchGraphRoundVotingStrategy,
} from "../src/utils";
import { ChainId, GraphResponse } from "../src/types";
import { DatabaseInstance } from "../src/database";

async function main() {
  // Database instance
  const db = new DatabaseInstance();

  let chainId: keyof typeof ChainId;

  for (chainId in ChainId) {
    // Get current synced graph block metadata
    const currentBlockResponse = await fetchGraphMeta(ChainId[chainId]);
    if (!checkResponse(currentBlockResponse)) {
      return;
    }
    // look back 10 blocks
    const blockNumber = currentBlockResponse.data._meta.block.number - 10;
    console.log("Seeding database for", chainId, "at block", blockNumber);
    await seedDatabaseOfChain(db, ChainId[chainId], blockNumber);
  }
}

// Run main function
main().then(() => {
  // close db connection
  process.exit(0);
});

function checkResponse(response: GraphResponse<any>) {
  if (response.error) {
    console.log("Error fetching data: ", response.error);
    return false;
  }

  if (!response.data) {
    console.log("No data found in graph");
    return false;
  }

  return true;
}

async function seedDatabaseOfChain(
  db: DatabaseInstance,
  chainId: ChainId,
  blockNumber: number
) {
  // Get programs
  const programsResponse = await fetchGraphPrograms(chainId, blockNumber);

  if (!checkResponse(programsResponse)) {
    return;
  }

  // Store programs in db
  await db.createProgramRecords(chainId, programsResponse.data.programs);

  // Read programs from db
  const programs = await db.getPrograms(chainId);

  if (!programs) {
    console.log("No programs found in db");
    return;
  }

  // Parse program ids
  const programIds = programs.map((program) => program.programId);

  // Get rounds
  const roundsResponse = await fetchGraphProgramRounds(
    chainId,
    programIds,
    blockNumber
  );

  if (!checkResponse(roundsResponse)) {
    return;
  }

  // Store rounds in db
  await db.createRoundRecords(chainId, roundsResponse.data.rounds);

  // Read rounds from db
  const rounds = await db.getRounds(chainId);

  if (!rounds) {
    console.log("No rounds found in db");
    return;
  }

  // Parse round ids
  const roundIds = rounds.map((round) => round.roundId);

  for (const roundId of roundIds) {
    // Get projects
    const projectsResponse = await fetchGraphRoundProjects(
      chainId,
      roundId,
      blockNumber
    );

    if (!checkResponse(projectsResponse)) {
      return;
    }

    // Store projects in db
    await db.createProjectRecords(chainId, projectsResponse.data.roundProjects);
  }

  // Get voting strategies
  const votingStrategiesResponse = await fetchGraphRoundVotingStrategy(
    chainId,
    roundIds,
    blockNumber
  );

  if (!checkResponse(votingStrategiesResponse)) {
    return;
  }

  // Store voting strategies in db
  await db.createVotingStrategyRecords(
    chainId,
    votingStrategiesResponse.data.votingStrategies
  );

  // Read voting strategies from db
  const votingStrategies = await db.getVotingStrategies(chainId);

  if (!votingStrategies) {
    console.log("No voting strategies found in db");
    return;
  }

  // Parse voting strategy ids
  const votingStrategyIds = votingStrategies.map(
    (votingStrategy) => votingStrategy.strategyId
  );

  for (const votingStrategyId of votingStrategyIds) {
    // Get qfvotes
    const qfvotesResponse = await fetchGraphQFVotes(
      chainId,
      votingStrategyId,
      blockNumber
    );

    if (!checkResponse(qfvotesResponse)) {
      return;
    }

    // Store qfvotes in db
    await db.createQFVoteRecords(chainId, qfvotesResponse.data.qfvotes);
  }
}
