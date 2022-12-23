import {PrismaClient, VotingStrategy} from "@prisma/client";
import {getChainVerbose} from "./utils";
import {QFContributionSummary, QFDistribution, RoundMetadata} from "./types";

export class DatabaseInstance {

  private client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  async createRoundRecord(roundId: string, chainId: string, votingStrategyName: VotingStrategy) {
    try {
      const chainIdVerbose = getChainVerbose(chainId);
      const round = await this.client.round.create({
        data: {
          chainId: chainIdVerbose,
          roundId,
          votingStrategyName: votingStrategyName,
        }
      });
      return round;
    } catch (error) {
      console.error("error creating round entry", error);
      return;
    }
  }

  async upsertRoundRecord(roundId: string, update: any, create: any) {
    try {
      const round = await this.client.round.upsert({
        where: {
          roundId: roundId,
        },
        update: update,
        create: create,
      });
      return round;
    } catch (error) {
      console.error("error upserting round entry", error);
      return;
    }
  }

  async createProjectRecord(chainId: string, roundId: string, projectId: string) {
    try {
      const chainIdVerbose = getChainVerbose(chainId);
      const project = await this.client.project.create({
        data: {
          projectId: projectId,
          roundId: roundId,
          chainId: chainIdVerbose,
        }
      });
      return project;
    } catch (error) {
      console.error("error", error);
      return;
    }

  }

  async upsertProjectRecord(roundId: string, projectId: string,  update: any, create: any) {
    try {
      const project = await this.client.project.upsert({
        where: {
          projectId: projectId,
        },
        update: update,
        create: create,
      });
      return project;
    } catch (error) {
      console.error("error", error);
      return;
    }
  }

  async upsertProjectMatchRecord(chainId: string, roundId: string, metadata: RoundMetadata, projectMatch: QFDistribution) {

    try {
      const chainIdVerbose = getChainVerbose(chainId);

      const round = await this.client.round.upsert({
        where: {roundId: roundId},
        create: {
          roundId: roundId,
          chainId: chainIdVerbose,
          votingStrategyName: metadata.votingStrategy.strategyName as VotingStrategy,
          matches: {
            create:
              {
                matchAmountInUSD: projectMatch.matchAmountInUSD,
                projectId: projectMatch.projectId,
                totalContributionsInUSD: Number(projectMatch.totalContributionsInUSD),
                matchPoolPercentage: Number(projectMatch.matchPoolPercentage),
                matchAmountInToken: Number(projectMatch.matchAmountInToken),
                projectPayoutAddress: projectMatch.projectPayoutAddress,
              },
          },
        },
        update: {
          matches: {
            upsert: {
              where: {projectId: projectMatch.projectId},
              create: {
                matchAmountInUSD: projectMatch.matchAmountInUSD,
                projectId: projectMatch.projectId,
                totalContributionsInUSD: Number(projectMatch.totalContributionsInUSD),
                matchPoolPercentage: Number(projectMatch.matchPoolPercentage),
                matchAmountInToken: Number(projectMatch.matchAmountInToken),
                projectPayoutAddress: projectMatch.projectPayoutAddress,
              },
              update: {
                matchAmountInUSD: projectMatch.matchAmountInUSD,
                totalContributionsInUSD: Number(projectMatch.totalContributionsInUSD),
                matchPoolPercentage: Number(projectMatch.matchPoolPercentage),
                matchAmountInToken: Number(projectMatch.matchAmountInToken),
              },
            },
          },
        },
      });

      return;

    } catch (error) {
      console.error("error", error);
      return;
    }

  }

  async upsertRoundSummaryRecord(chainId: string, roundId: string,  metadata: RoundMetadata, summary: QFContributionSummary): Promise<void> {

    try {
      const chainIdVerbose = getChainVerbose(chainId);

      await this.client.round.upsert({
        where: {roundId: roundId},
        create: {
          roundId: roundId,
          chainId: chainIdVerbose,
          votingStrategyName: metadata.votingStrategy.strategyName as VotingStrategy,
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
          votingStrategyName: metadata.votingStrategy.strategyName as VotingStrategy,
          roundSummary: {
            upsert: {
              create: {
                contributionCount: summary.contributionCount,
                uniqueContributors: summary.uniqueContributors,
                totalContributionsInUSD: Number(summary.totalContributionsInUSD),
                averageUSDContribution: Number(summary.averageUSDContribution),
              },
              update: {
                contributionCount: summary.contributionCount,
                uniqueContributors: summary.uniqueContributors,
                totalContributionsInUSD: Number(summary.totalContributionsInUSD),
                averageUSDContribution: Number(summary.averageUSDContribution),
              },
            },
          },
        },
      });

      return;
    } catch (error) {
      console.error("error", error);
      return;
    }

  }


  async upsertProjectSummaryRecord(chainId: string, roundId: string, projectId: string, metadata: RoundMetadata, summary: QFContributionSummary): Promise<void> {
    try {
      const chainIdVerbose = getChainVerbose(chainId);

      await this.client.round.upsert({
        where: {
          roundId: roundId,
        },
        update: {
          chainId: chainIdVerbose,
          votingStrategyName: metadata.votingStrategy.strategyName as VotingStrategy,
          projects: {
            upsert: {
              where: {projectId: projectId},
              update: {
                projectSummary: {
                  update: {
                    contributionCount: summary.contributionCount,
                    uniqueContributors: summary.uniqueContributors,
                    totalContributionsInUSD: Number(summary.totalContributionsInUSD),
                    averageUSDContribution: Number(summary.averageUSDContribution),
                  }
                }
              },
              create: {
                projectId: projectId,
                chainId: chainIdVerbose,
                projectSummary: {
                  create: {
                    contributionCount: summary.contributionCount,
                    uniqueContributors: summary.uniqueContributors,
                    totalContributionsInUSD: Number(summary.totalContributionsInUSD),
                    averageUSDContribution: Number(summary.averageUSDContribution),
                  }
                }
              }
            }
          }
        },
        create: {
          roundId: roundId,
          chainId: chainIdVerbose,
          votingStrategyName: metadata.votingStrategy.strategyName as VotingStrategy,
          projects: {
            create: {
              projectId: projectId,
              chainId: chainIdVerbose,
              projectSummary: {
                create: {
                  contributionCount: summary.contributionCount,
                  uniqueContributors: summary.uniqueContributors,
                  totalContributionsInUSD: Number(summary.totalContributionsInUSD),
                  averageUSDContribution: Number(summary.averageUSDContribution),
                }
              }
            }
          }
        }
      });

      return;
    } catch (error) {
      console.error("error upserting project summary", error);
      return;
    }
  }

  async getRoundMatchRecord(roundId: string): Promise<QFDistribution[]> {
    try {
      const round = await this.client.round.findUnique({
        where: {roundId: roundId},
        include: {
          matches: true,
        },
      });
      if (!round) {
        return [];
      }
      return round.matches;
    } catch (error) {
      console.error("error getting round match", error);
      return [];
    }
  }

  async getRoundSummaryRecord(roundId: string): Promise<any> {
    try {
      const roundSummary = await this.client.roundSummary.findUnique({
        where: {roundId: roundId},
      });
      return roundSummary;
    } catch (error) {
      console.error("error getting round summary", error);
      return null;
    }
  }

  async getProjectSummaryRecord(roundId: string, projectId: string): Promise<any> {
    try {
      const round = await this.client.round.findUnique({
        where: {roundId: roundId},
        include: {
          projects: {
            where: {projectId: projectId},
            include: {
              projectSummary: true,
            },
          },
        },
      });
      if (!round) {
        return null;
      }
      return round.projects[0].projectSummary;
    } catch (error) {
      console.error("error getting project summary", error);
      return null;
    }
  }

  async getProjectMatchRecord(roundId: string, projectId: string): Promise<any> {
    try {
      const match = await this.client.match.findUnique({
        where: {
          projectId: projectId,
        },
      });
      if (!match) {
        return null;
      }
      return match;
    } catch (error) {
      console.error("error getting project match", error);
      return null;
    }
  }

  async getProjectSummaryRecordsByIds(roundId: string, projectIds: string[]): Promise<any> {
    try {
      const projects = await this.client.projectSummary.findMany({
        where: {
          projectId: {
            in: projectIds,
          },
        }
      });
      return projects;
    } catch (error) {
      console.error("error getting project summaries", error);
      return null;
    }
  }

  async getRoundRecord(roundId: string): Promise<any> {
    try {
      const round = await this.client.round.findUnique({
        where: {roundId: roundId},
      });
      if (!round) {
        return null;
      }
      return round;
    } catch (error) {
      console.error("error getting round", error);
      return null;
    }
  }

  async getProjectRecord(projectId: string): Promise<any> {
    try {
      const project = await this.client.project.findUnique({
        where: {projectId: projectId},
      });
      if (!project) {
        return null;
      }
      return project;
    } catch (error) {
      console.error("error getting project", error);
      return null;
    }
  }

}

export const db = new DatabaseInstance();