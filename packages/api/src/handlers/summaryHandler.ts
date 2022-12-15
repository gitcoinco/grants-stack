import { ChainId, ProjectSummary, QFContribution, RoundMetadata } from "../types";
import { denominateAs, fetchFromGraphQL, fetchRoundMetadata, getStrategyName, getUSDCAddress, handleResponse } from "../utils";
import { Request, Response } from "express";

export const summaryHandler = async (req: Request, res: Response) => {
  const { chainId, roundId } = req.params;
  // const { projectId } = req.query;

  if (!chainId || !roundId) {
    handleResponse(res, 400, "error: missing parameter chainId or roundId");
  }
  // if (projectId) {
  //   const projectIds: string[] = projectId.toString().split(",");

  //   // fetch project summaries
  //   try {
  //     const results = await getProjectsSummary(chainId as ChainId, roundId, projectIds);

  //     return handleResponse(res, 200, "fetched project summary successfully", results);
  //   } catch (err) {
  //     return handleResponse(res, 500, "error: something went wrong");
  //   }

  // } else {
    // fetch round stats
    try {
      const results = await getRoundSummary(chainId as ChainId, roundId);

      return handleResponse(res, 200, "fetched round summary successfully", results);
    } catch (err) {
      return handleResponse(res, 500, "error: something went wrong", err);
    }
  // }
}

export const getRoundSummary = async (chainId: ChainId, roundId: string): Promise<any> => {
  let results;

  // fetch metadata
  const metadata = await fetchRoundMetadata(chainId, roundId);

  let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

  strategyName = getStrategyName(strategyName);

  // handle how stats should be derived per voting strategy
  switch (strategyName) {
    case "LINEAR_QUADRATIC_FUNDING":
      // fetch votes
      const votes = await fetchContributionsForRound(chainId, votingStrategyId);
      // fetch round stats
      results =  await summarizeRound(chainId, metadata, votes);
      break;
    default:
      throw("error: unsupported voting strategy");
  }

  return results;
}

// export const getProjectsSummary = async (chainId: ChainId, roundId: string, projectIds: string[]): Promise<any> => {
//   let results: any = [];
//   // fetch metadata
//   const metadata = await fetchRoundMetadata(chainId, roundId);

//   let { id: votingStrategyId, strategyName } = metadata.votingStrategy;

//   strategyName = getStrategyName(strategyName);

//   // handle how stats should be derived per voting strategy
//   switch (strategyName) {
//     case "LINEAR_QUADRATIC_FUNDING":
//       // fetch votes
//       const votes = await fetchVotesForProjects(chainId, votingStrategyId, projectIds);
//       // fetch round stats
//       results =  await summarizeProjects(chainId, votes);
//       break;
//     default:
//       throw("error: unsupported voting strategy");
//   }

//   return results;
// }

// export const summarizeProjects = async (
//   chainId: ChainId,
//   contributions: QFContribution[],
// ): Promise<ProjectSummary> => {

//   // Create an object to store the sums
//   const summary: any = {};

//   // Iterate over the array of objects
//   contributions.forEach((item: QFContribution) => {
//     // Get the project ID and token
//     const projectId = item.projectId;
//     const token = item.token;
//     const contributor = item.contributor;


//     // Initialize the object for the project ID if it doesn't exist
//     if (!summary[projectId]) {
//       summary[projectId] = {} as ProjectSummary;
//       summary[projectId].contributions = {};
//       summary[projectId].contributors = [];
//     }

//     // Initialize the sum for the token if it doesn't exist
//     if (!summary[projectId].contributions[token]) {
//       summary[projectId].contributions[token] = 0;
//     }
//     // Initialize the contributor if it doesn't exist
//     if (!summary[projectId].contributors.includes(contributor)) {
//       summary[projectId].contributors.push(contributor);
//     }

//     // Update the sum for the token
//     summary[projectId].contributions[token] += item.amount;

//   });

//   // Return the sums object
//   return summary;
// }

// export const fetchVotesForProjects = async (
//   chainId: ChainId,
//   votingStrategyId: string,
//   projectIds: string[]
// ): Promise<QFContribution[]> => {
//   const variables = { votingStrategyId, projectIds };

//   // query and filter votes for a project by id
//   const query = `
//       query GetVotesForProjectsInRound($votingStrategyId: String, $projectIds: [String!]) {
//       votingStrategies(where: {
//         id: $votingStrategyId
//       }) {
//         votes(where: {
//           to_in: $projectIds
//         }){
//           amount
//           token
//           from
//           to
//         }
//       }
//     }
//     `;

//   // fetch from graphql
//   const response = await fetchFromGraphQL(chainId, query, variables);

//   const votes = response.data?.votingStrategies[0]?.votes;

//   let contributions: QFContribution[] = [];

//   votes.map((vote: any) => {
//     const contribution = {
//       projectId: vote.to, // TODO: we will have to update this to project id eventually
//       contributor: vote.from,
//       amount: Number(vote.amount),
//       token: vote.token,
//     } as QFContribution;

//     contributions.push(contribution);
//   });

//   return contributions;
// };

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param chainId - The chain ID of the blockchain indexed by the subgraph
 * @param votingStrategyId - The voting strategy address
 * @returns The result of the query
 */
export const fetchContributionsForRound = async (
  chainId: ChainId,
  votingStrategyId: string,
): Promise<QFVote[]> => {
  const variables = { votingStrategyId };

  // TODO: REPLACE to with projectId after upgrade
  // TODO: implement paging here instead of hard-coded limit of 1000
  const query = `
    query GetContributionsForRound($votingStrategyId: String) {
      votingStrategies(where:{
        id: $votingStrategyId
      }) {
        votes(first: 1000) {
          amount
          token
          from
          to
        }
        round {
          roundStartTime
          roundEndTime
          token
        }
      }
    }
  `;

  // fetch from graphql
  const response = await fetchFromGraphQL(chainId, query, variables);

  const votes: QFVote[] = [];
  
  response.data?.votingStrategies[0]?.votes.map((vote: any) => {
    votes.push({
      amount: vote.amount,
      token: vote.token,
      contributor: vote.from,
      projectId: vote.to, // TODO: update to projectID after contract upgrade
    })
  })


  return votes;
}

type QFVote = {
  amount: number;
  token: string;
  contributor: string;
  projectId: string;
};


type RoundSummary = {
  contributionCount: number; 
  uniqueContributors: number;
  totalContributionsInUSD?: string; 
  averageUSDContribution?: string; 
};

export const summarizeRound = async (
  chainId: ChainId,
  roundMetadata: RoundMetadata,
  contributions: QFVote[],
): Promise<RoundSummary> => {

  // Create an object to store the sums
  const summary: RoundSummary = {
    contributionCount: 0, 
    uniqueContributors: 0, 
    totalContributionsInUSD: "", 
    averageUSDContribution: "",
  };

  const summaryContributions: any = {
    contributions: {},
    contributors: [],
  };
  
  // Iterate over the array of objects
  contributions.forEach((item: QFVote) => {
    // Get the token
    const token = item.token;
    const contributor = item.contributor;

    // Initialize the sum for the token if it doesn't exist
    if (!summaryContributions.contributions[token]) {
      summaryContributions.contributions[token] = 0;
    }

    // Initialize the contributor if it doesn't exist
    if (!summaryContributions.contributors.includes(contributor)) {
      summaryContributions.contributors.push(contributor);
    }
    // Update the sum for the token
    summaryContributions.contributions[token] += Number(item.amount);
  });
  
  const usdcAddress = getUSDCAddress(chainId);
  let totalContributionsInUSD = 0;

  Object.values(summaryContributions.contributions).map(async (contributionsInToken: any) => {

    const amountInUSDC = await denominateAs(
      contributionsInToken.token,
      usdcAddress,
      contributionsInToken.amount,
      roundMetadata.roundStartTime,
      roundMetadata.roundEndTime,
      chainId
    );

    totalContributionsInUSD += amountInUSDC.amount;

  });

  summary.totalContributionsInUSD = totalContributionsInUSD.toString();
  summary.contributionCount = contributions.length;
  summary.uniqueContributors = summaryContributions.contributors.length;
  summary.averageUSDContribution = (Number(summary.totalContributionsInUSD) / summary.uniqueContributors).toString();

  return summary;
}



