import { Contribution } from "data-layer";

export type ContributionsData = {
  chainIds: number[];
  contributions: Contribution[];
  totals?: {
    totalDonations: number;
    totalUniqueContributions: number;
    totalProjectsFunded: number;
  };
  contributionsById: ContributionsById;
  contributionsByStatusAndHashAndRoundId: ContributionsByStatusAndHashAndRoundId;
  contributionsToDirectGrants: Contribution[];
};

export type ContributionsByTxnHash = Record<string, Contribution[]>;
export type ContributionsById = Record<string, Contribution>;
export type ContributionsByRoundStatus = Partial<
  Record<ContributionRoundStatus, Contribution[]>
>;
export type ContributionsByRoundId = Record<string, Contribution[]>;
export type ContributionsByHashAndRoundId = Record<
  string,
  ContributionsByRoundId
>;
export type ContributionsByStatusAndHashAndRoundId = {
  [K in ContributionRoundStatus]?: K extends "direct"
    ? Contribution[]
    : ContributionsByHashAndRoundId;
};

export type ContributionRoundStatus = "direct" | "active" | "past";
