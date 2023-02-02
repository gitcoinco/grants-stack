import { PrismaClient, VotingStrategy, Match, ChainId } from "@prisma/client";
import { getChainVerbose } from "./utils";
import {
  QFContribution,
  QFContributionSummary,
  QFDistribution,
  Result,
  RoundMetadata,
} from "./types";

export class DatabaseInstance {
  private client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  async createRoundRecord(
    chainId: string,
    roundId: string,
    votingStrategyName: VotingStrategy
  ): Promise<Result> {
    try {
      const chainIdVerbose = getChainVerbose(chainId);
      await this.client.round.create({
        data: {
          chainId: chainIdVerbose,
          roundId,
          votingStrategyName: votingStrategyName,
        },
      });
      return { result: true };
    } catch (error) {
      console.error("error creating round entry", error);
      return { error: error, result: false };
    }
  }

  async upsertRoundRecord(
    roundId: string,
    update: any,
    create: any
  ): Promise<Result> {
    try {
      await this.client.round.upsert({
        where: {
          roundId: roundId,
        },
        update: update,
        create: create,
      });
      return { result: true };
    } catch (error) {
      console.error("error upserting round entry", error);
      return { error: error, result: false };
    }
  }

  async createProjectRecord(
    chainId: string,
    roundId: string,
    projectId: string
  ): Promise<Result> {
    try {
      const chainIdVerbose = getChainVerbose(chainId);
      await this.client.project.create({
        data: {
          projectId: projectId,
          roundId: roundId,
          chainId: chainIdVerbose,
        },
      });
      return { result: true };
    } catch (error) {
      console.error("error creating project", error);
      return { error: error, result: false };
    }
  }

  async createVoteRecord(
    chainId: string,
    roundId: string,
    roundMetadata: RoundMetadata,
    vote: QFContribution,
  ): Promise<Result> {
    try {

      // check if round exists
      const roundExists = await this.client.round.findUnique({
        where: { roundId: roundId },
      });

      // if round doesn't exist, create it
      if (!roundExists) {
        await this.createRoundRecord(
          chainId,
          roundId,
          roundMetadata.votingStrategy.strategyName as VotingStrategy
        );
      }

      // check if project exists
      const projectExists = await this.client.project.findUnique({
        where: {
          projectIdentifier: {
            projectId: vote.projectId,
            roundId: roundId,
          }
        },
      });

      // if project doesn't exist, create it
      if (!projectExists) {
        await this.createProjectRecord(
          chainId,
          roundId,
          vote.projectId
        );
      }

      const voteData = {
        roundId: roundId,
        voterAddress: vote.contributor,
        voterWeight: 1,
        projectId: vote.projectId,
        voteAmountInUSD: vote.usdValue ?? 0,
        voteAmountInToken: vote.amount.toString() ?? "0",
      }

      // create vote
      await this.client.vote.create({
        data: voteData,

      });

      return { result: true };
    } catch (error) {
      console.error("error creating vote", error);
      return { error: error, result: false };

    }
  }

  async createVoteRecords(
    chainId: string,
    roundId: string,
    roundMetadata: RoundMetadata,
    votes: QFContribution[],
  ) {
    try {

      const voteData : any = [];
        for (const vote of votes) {

          // check if round exists
          const roundExists = await this.client.round.findUnique({
            where: { roundId: roundId },
          });

          // if round doesn't exist, create it
          if (!roundExists) {
            this.createRoundRecord(
              chainId,
              roundId,
              roundMetadata.votingStrategy.strategyName as VotingStrategy,
            )
          }

          // check if project exists
          const projectExists = await this.client.project.findUnique({
            where: {
              projectIdentifier: {
                projectId: vote.projectId,
                roundId: roundId,
              }
            },
          });

          // if project doesn't exist, create it
          if (!projectExists) {
            this.createProjectRecord(
              chainId,
              roundId,
              vote.projectId,
            );
          }

          voteData.push({
            roundId: roundId,
            voterAddress: vote.contributor,
            voterWeight: 1,
            projectId: vote.projectId,
            voteAmountInUSD: vote.usdValue ?? 0,
            voteAmountInToken: vote.amount.toString() ?? "0",
          });
        }
      await this.client.vote.createMany({
        data: voteData,
      });
      return { result: true };
    } catch (error) {
      console.error("error creating votes", error);
      return { error: error, result: false };
    }
  }

  async upsertProjectRecord(
    roundId: string,
    projectId: string,
    update: any,
    create: any
  ): Promise<Result> {
    try {
      await this.client.project.upsert({
        where: {
          projectIdentifier: {
            projectId: projectId,
            roundId: roundId,
          }
        },
        update: update,
        create: create,
      });
      return { result: true };
    } catch (error) {
      console.error("error upserting project", error);
      return { error: error, result: false };
    }
  }

  async upsertProjectMatchRecord(
    chainId: string,
    roundId: string,
    metadata: RoundMetadata,
    projectMatch: QFDistribution
  ): Promise<Result> {
    try {
      const chainIdVerbose = getChainVerbose(chainId);

      const matchData = {
        matchAmountInUSD: projectMatch.matchAmountInUSD,
        projectId: projectMatch.projectId,
        totalContributionsInUSD: Number(
          projectMatch.totalContributionsInUSD
        ),
        matchPoolPercentage: Number(projectMatch.matchPoolPercentage),
        matchAmountInToken: Number(projectMatch.matchAmountInToken),
        projectPayoutAddress: projectMatch.projectPayoutAddress,
        uniqueContributorsCount: Number(
          projectMatch.uniqueContributorsCount
        ),
      }

      const roundData = {
        roundId: roundId,
        chainId: chainIdVerbose as ChainId,
        votingStrategyName: metadata.votingStrategy.strategyName as VotingStrategy,
        matches: { create: matchData },
      }

      // upsert with match data
      await this.client.round.upsert({
          where: { roundId: roundId },
          create: roundData,
          update: {
            matches: {
              upsert: {
                where: {
                  matchIdentifier: {
                    projectId: projectMatch.projectId,
                    roundId: roundId,
                  }
                },
                create: matchData,
                update: matchData,
              }
            }
          }
        }
      );
      return { result: true };
    } catch (error) {
      console.error("error upserting project match", error);
      return { error: error, result: false };
    }
  }

  async upsertRoundSummaryRecord(
    chainId: string,
    roundId: string,
    metadata: RoundMetadata,
    summary: QFContributionSummary
  ): Promise<Result> {
    try {
      const chainIdVerbose = getChainVerbose(chainId);

      const roundSummaryData = {
        contributionCount: summary.contributionCount,
        uniqueContributors: summary.uniqueContributors,
        totalContributionsInUSD: Number(summary.totalContributionsInUSD),
        averageUSDContribution: Number(summary.averageUSDContribution),
      }

      const roundData = {
        roundId: roundId,
        chainId: chainIdVerbose as ChainId,
        votingStrategyName: metadata.votingStrategy.strategyName as VotingStrategy,
        roundSummary: { create: roundSummaryData },
      }

      // upsert with round summary data
      await this.client.round.upsert({
        where: { roundId: roundId },
        create: roundData,
        update: {
          roundSummary: {
            update: roundSummaryData,
          }
        }
      });

      return { result: true };
    } catch (error) {
      console.error("error upserting round summary", error);
      return { error: error, result: false };
    }
  }

  async upsertProjectSummaryRecord(
    chainId: string,
    roundId: string,
    projectId: string,
    metadata: RoundMetadata,
    summary: QFContributionSummary
  ): Promise<Result> {
    try {
      const chainIdVerbose = getChainVerbose(chainId);

      const roundData = {
        roundId: roundId,
        chainId: chainIdVerbose as ChainId,
        votingStrategyName: metadata.votingStrategy.strategyName as VotingStrategy,
      }

      const projectSummaryData = {
        contributionCount: summary.contributionCount,
        uniqueContributors: summary.uniqueContributors,
        totalContributionsInUSD: Number(summary.totalContributionsInUSD),
        averageUSDContribution: Number(summary.averageUSDContribution),
      }

      const projectData = {
        roundId: roundId,
        projectId: projectId,
        chainId: chainIdVerbose as ChainId,
        projectSummaries: { create: projectSummaryData },
      }

      // check if round exists
      const roundExists = await this.client.round.findUnique({
        where: { roundId: roundId },
      });

      // if round doesn't exist, create it
      if (!roundExists) {
        await this.client.round.create({
          data: roundData,
        });
      }

      // check if project exists
      const projectExists = await this.client.project.findUnique({
        where: {
          projectIdentifier: {
            projectId: projectId,
            roundId: roundId,
          }
        },
      });

      // if project doesn't exist, create it
      if (!projectExists) {
        await this.client.project.create({
          data: projectData,
        });
      }

      // upsert the project summary data
      await this.client.project.upsert({
          where: {
            projectIdentifier: {
              projectId: projectId,
              roundId: roundId,
            }
          },
          create: projectData,
          update: {
            projectSummaries: {
              upsert: {
                where: {
                  projectSummaryIdentifier: {
                    projectId: projectId,
                    roundId: roundId,
                  }
                },
                create: projectSummaryData,
                update: projectSummaryData,
              }
            }
          }
        }
      );

      return { result: true };
    } catch (error) {
      console.error("error upserting project summary", error);
      return { error: error, result: false };
    }
  }

  async getRoundMatchRecord(roundId: string): Promise<Result> {
    try {
      const result: Match[] = await this.client.match.findMany({
        where: { roundId: roundId },
      });
      return { result };
    } catch (error) {
      console.error("error getting round match", error);
      return { error: error, result: null };
    }
  }

  async getRoundSummaryRecord(roundId: string): Promise<Result> {
    try {
      const result = await this.client.roundSummary.findUnique({
        where: { roundId: roundId },
      });
      return { result };
    } catch (error) {
      console.error("error getting round summary", error);
      return { error: error, result: null };
    }
  }

  async getProjectSummaryRecord(
    roundId: string,
    projectId: string
  ): Promise<Result> {
    try {
      const result = await this.client.projectSummary.findUnique({
        where: {
          projectSummaryIdentifier: {
            roundId: roundId,
            projectId: projectId,
          }
        },
      });
      return { result };
    } catch (error) {
      console.error("error getting project summary", error);
      return { error: error, result: null };
    }
  }

  async getProjectMatchRecord(
    roundId: string,
    projectId: string
  ): Promise<Result> {
    try {
      const result = await this.client.match.findUnique({
        where: {
          matchIdentifier: {
            roundId: roundId,
            projectId: projectId,
          }
        },
      });
      return { result };
    } catch (error) {
      console.error("error getting project match", error);
      return { error: error, result: null };
    }
  }

  async getProjectSummaryRecordsByIds(
    roundId: string,
    projectIds: string[]
  ): Promise<Result> {
    try {
      const result = await this.client.projectSummary.findMany({
        where: {
          projectId: {
            in: projectIds,
          },
        },
      });
      return { result };
    } catch (error) {
      console.error("error getting project summaries", error);
      return { error: error, result: null };
    }
  }

  async getRoundRecord(roundId: string): Promise<Result> {
    try {
      const result = await this.client.round.findUnique({
        where: { roundId: roundId },
      });

      return { result };
    } catch (error) {
      console.error("error getting round", error);
      return { error: error, result: null };
    }
  }

  async getProjectRecord(roundId: string, projectId: string): Promise<Result> {
    try {
      const result = await this.client.project.findUnique({
        where: {
          projectIdentifier: {
            projectId: projectId,
            roundId: roundId,
          }
        },
      });
      return { result };
    } catch (error) {
      console.error("error getting project", error);
      return { error: error, result: null };
    }
  }

  async getVotesForRound(roundId: string): Promise<Result> {
    try {
      const result = await this.client.vote.findMany({
        where: { roundId: roundId },
      });
      return { result };
    } catch (error) {
      console.error("error getting votes for round", error);
      return { error: error, result: null };
    }
  }

  async getVotesForProject(roundId: string, projectId: string): Promise<Result> {
    try {
      const result = await this.client.vote.findMany({
        where: {
            roundId: roundId,
            projectId: projectId,
        },
      });
      return { result };
    } catch (error) {
      console.error("error getting votes for project", error);
      return { error: error, result: null };
    }
  }
}

export const db = new DatabaseInstance();
