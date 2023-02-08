import { PrismaClient, Prisma } from "@prisma/client";
import {
  GraphProgram,
  GraphRoundProject,
  GraphRound,
  GraphVotingStrategy,
  GraphQFVote,
  ChainId,
} from "./types";

export class DatabaseInstance {
  private client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  ///////////////////////////
  //    CREATE RECORDS     //
  ///////////////////////////

  async createProgramRecords(chainId: ChainId, data: GraphProgram[]) {
    try {
      const programs: Array<Prisma.ProgramCreateManyInput> = [];
      for (const program of data) {
        programs.push({
          programId: program.id,
          chainId: chainId,
          programCreatedAt: program.createdAt,
          programUpdatedAt: program.updatedAt,
        });
      }

      await this.client.program.createMany({
        data: programs,
        skipDuplicates: true,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async createRoundRecords(chainId: ChainId, data: GraphRound[]) {
    try {
      const rounds: Array<Prisma.RoundCreateManyInput> = [];
      for (const round of data) {
        rounds.push({
          chainId: chainId,
          programId: round.program.id,
          roundId: round.id,
          roundCreatedAt: round.createdAt,
          roundUpdatedAt: round.updatedAt,
          applicationsStartTime: round.applicationsStartTime,
          applicationsEndTime: round.applicationsEndTime,
          roundStartTime: round.roundStartTime,
          roundEndTime: round.roundEndTime,
          roundToken: round.token,
          payoutStrategy: round.payoutStrategy,
        });
      }

      await this.client.round.createMany({
        data: rounds,
        skipDuplicates: true,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async createVotingStrategyRecords(
    chainId: ChainId,
    data: GraphVotingStrategy[]
  ) {
    try {
      const votingStrategies: Array<Prisma.VotingStrategyCreateManyInput> = [];
      for (const votingStrategy of data) {
        votingStrategies.push({
          chainId: chainId,
          roundId: votingStrategy.round.id,
          strategyVersion: votingStrategy.version,
          strategyName: votingStrategy.strategyName,
          strategyAddress: votingStrategy.strategyAddress,
          strategyId: votingStrategy.id,
        });
      }

      await this.client.votingStrategy.createMany({
        data: votingStrategies,
        skipDuplicates: true,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async createProjectRecords(chainId: ChainId, data: GraphRoundProject[]) {
    try {
      const projects: Array<Prisma.ProjectCreateManyInput> = [];
      for (const project of data) {
        projects.push({
          chainId: chainId,
          roundId: project.round.id,
          projectId: project.project,
          projectCreatedAt: project.createdAt,
          projectUpdatedAt: project.updatedAt,
          projectPayoutAddress: project.payoutAddress,
          projectStatus: project.status,
        });
      }

      await this.client.project.createMany({
        data: projects,
        skipDuplicates: true,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async createQFVoteRecords(chainId: ChainId, data: GraphQFVote[]) {
    try {
      const qfVotes: Array<Prisma.VoteCreateManyInput> = [];
      for (const vote of data) {
        qfVotes.push({
          chainId: chainId,
          roundId: vote.votingStrategy.round.id,
          projectId: vote.projectId,
          voteStrategyId: vote.votingStrategy.id,
          voterAddress: vote.from,
          voteCreatedAt: vote.createdAt,
          voteAmount: vote.amount,
          voteToken: vote.token,
          voteVersion: vote.version,
          voteId: vote.id,
          voteToAddress: vote.to,
        });
      }

      await this.client.vote.createMany({
        data: qfVotes,
        skipDuplicates: true,
      });
    } catch (e) {
      console.error(e);
    }
  }

  ///////////////////////////
  //     READ RECORDS      //
  ///////////////////////////

  async getPrograms(chainId: ChainId) {
    try {
      const programs = await this.client.program.findMany({
        where: {
          chainId: chainId,
        },
      });
      return programs;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getRounds(chainId: ChainId) {
    try {
      const rounds = await this.client.round.findMany({
        where: {
          chainId: chainId,
        },
      });
      return rounds;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getVotingStrategies(chainId: ChainId) {
    try {
      const votingStrategies = await this.client.votingStrategy.findMany({
        where: {
          chainId: chainId,
        },
      });
      return votingStrategies;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  //////////////
  // OLD CODE //
  //////////////
  // (here be the demons) //

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
          },
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
        totalContributionsInUSD: Number(projectMatch.totalContributionsInUSD),
        matchPoolPercentage: Number(projectMatch.matchPoolPercentage),
        matchAmountInToken: Number(projectMatch.matchAmountInToken),
        projectPayoutAddress: projectMatch.projectPayoutAddress,
        uniqueContributorsCount: Number(projectMatch.uniqueContributorsCount),
      };

      const roundData = {
        roundId: roundId,
        chainId: chainIdVerbose as ChainId,
        votingStrategyName: metadata.votingStrategy
          .strategyName as VotingStrategy,
        matches: { create: matchData },
      };

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
                },
              },
              create: matchData,
              update: matchData,
            },
          },
        },
      });
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
      };

      const roundData = {
        roundId: roundId,
        chainId: chainIdVerbose as ChainId,
        votingStrategyName: metadata.votingStrategy
          .strategyName as VotingStrategy,
        roundSummary: { create: roundSummaryData },
      };

      // upsert with round summary data
      await this.client.round.upsert({
        where: { roundId: roundId },
        create: roundData,
        update: {
          roundSummary: {
            create: roundSummaryData,
            update: roundSummaryData,
          },
        },
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
        votingStrategyName: metadata.votingStrategy
          .strategyName as VotingStrategy,
      };

      const projectSummaryData = {
        contributionCount: summary.contributionCount,
        uniqueContributors: summary.uniqueContributors,
        totalContributionsInUSD: Number(summary.totalContributionsInUSD),
        averageUSDContribution: Number(summary.averageUSDContribution),
      };

      const projectData = {
        roundId: roundId,
        projectId: projectId,
        chainId: chainIdVerbose as ChainId,
        projectSummaries: { create: projectSummaryData },
      };

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
          },
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
          },
        },
        create: projectData,
        update: {
          projectSummaries: {
            upsert: {
              where: {
                projectSummaryIdentifier: {
                  projectId: projectId,
                  roundId: roundId,
                },
              },
              create: projectSummaryData,
              update: projectSummaryData,
            },
          },
        },
      });

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
          },
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
          },
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
          },
        },
      });
      return { result };
    } catch (error) {
      console.error("error getting project", error);
      return { error: error, result: null };
    }
  }
}

export const db = new DatabaseInstance();
