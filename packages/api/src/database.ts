import { PrismaClient, VotingStrategy, Match } from "@prisma/client";
import { getChainVerbose } from "./utils";
import {
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
    roundId: string,
    chainId: string,
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

  async upsertProjectRecord(
    roundId: string,
    projectId: string,
    update: any,
    create: any
  ): Promise<Result> {
    try {
      await this.client.project.upsert({
        where: {
          projectId: projectId,
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
      await this.client.round.upsert({
        where: { roundId: roundId },
        create: {
          roundId: roundId,
          chainId: chainIdVerbose,
          votingStrategyName: metadata.votingStrategy
            .strategyName as VotingStrategy,
          matches: {
            create: {
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
            },
          },
        },
        update: {
          matches: {
            upsert: {
              where: { projectId: projectMatch.projectId },
              create: {
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
              },
              update: {
                matchAmountInUSD: projectMatch.matchAmountInUSD,
                totalContributionsInUSD: Number(
                  projectMatch.totalContributionsInUSD
                ),
                matchPoolPercentage: Number(projectMatch.matchPoolPercentage),
                matchAmountInToken: Number(projectMatch.matchAmountInToken),
                uniqueContributorsCount: Number(
                  projectMatch.uniqueContributorsCount
                ),
              },
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
      await this.client.round.upsert({
        where: { roundId: roundId },
        create: {
          roundId: roundId,
          chainId: chainIdVerbose,
          votingStrategyName: metadata.votingStrategy
            .strategyName as VotingStrategy,
          roundSummary: {
            create: {
              contributionCount: summary.contributionCount,
              uniqueContributors: summary.uniqueContributors,
              totalContributionsInUSD: Number(summary.totalContributionsInUSD),
              averageUSDContribution: Number(summary.averageUSDContribution),
            },
          },
        },
        update: {
          roundId: roundId,
          chainId: chainIdVerbose,
          votingStrategyName: metadata.votingStrategy
            .strategyName as VotingStrategy,
          roundSummary: {
            upsert: {
              create: {
                contributionCount: summary.contributionCount,
                uniqueContributors: summary.uniqueContributors,
                totalContributionsInUSD: Number(
                  summary.totalContributionsInUSD
                ),
                averageUSDContribution: Number(summary.averageUSDContribution),
              },
              update: {
                contributionCount: summary.contributionCount,
                uniqueContributors: summary.uniqueContributors,
                totalContributionsInUSD: Number(
                  summary.totalContributionsInUSD
                ),
                averageUSDContribution: Number(summary.averageUSDContribution),
              },
            },
          },
        },
      });
      return { result: true };
    } catch (error) {
      console.error("error", error);
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
      await this.client.round.upsert({
        where: {
          roundId: roundId,
        },
        update: {
          chainId: chainIdVerbose,
          votingStrategyName: metadata.votingStrategy
            .strategyName as VotingStrategy,
          projects: {
            upsert: {
              where: { projectId: projectId },
              update: {
                projectSummary: {
                  update: {
                    contributionCount: summary.contributionCount,
                    uniqueContributors: summary.uniqueContributors,
                    totalContributionsInUSD: Number(
                      summary.totalContributionsInUSD
                    ),
                    averageUSDContribution: Number(
                      summary.averageUSDContribution
                    ),
                  },
                },
              },
              create: {
                projectId: projectId,
                chainId: chainIdVerbose,
                projectSummary: {
                  create: {
                    contributionCount: summary.contributionCount,
                    uniqueContributors: summary.uniqueContributors,
                    totalContributionsInUSD: Number(
                      summary.totalContributionsInUSD
                    ),
                    averageUSDContribution: Number(
                      summary.averageUSDContribution
                    ),
                  },
                },
              },
            },
          },
        },
        create: {
          roundId: roundId,
          chainId: chainIdVerbose,
          votingStrategyName: metadata.votingStrategy
            .strategyName as VotingStrategy,
          projects: {
            create: {
              projectId: projectId,
              chainId: chainIdVerbose,
              projectSummary: {
                create: {
                  contributionCount: summary.contributionCount,
                  uniqueContributors: summary.uniqueContributors,
                  totalContributionsInUSD: Number(
                    summary.totalContributionsInUSD
                  ),
                  averageUSDContribution: Number(
                    summary.averageUSDContribution
                  ),
                },
              },
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
        where: { projectId },
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
          projectId: projectId,
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

  async getProjectRecord(projectId: string): Promise<Result> {
    try {
      const result = await this.client.project.findUnique({
        where: { projectId: projectId },
      });
      return { result };
    } catch (error) {
      console.error("error getting project", error);
      return { error: error, result: null };
    }
  }
}

export const db = new DatabaseInstance();
