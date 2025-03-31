import { useMemo } from "react";
import { getAddress } from "viem";
import { RoundWithStakes } from "./useRoundStakingSummary";
import { Application } from "data-layer";

export type ApplicationData = Application & {
  totalStaked: number;
  numberOfContributors: number;
  totalDonations: number;
};

export type SortOption =
  | "totalStakedDesc"
  | "totalDonationsDesc"
  | "totalContributorsDesc"
  | "totalStakedAsc"
  | "totalDonationsAsc"
  | "totalContributorsAsc";

export const useSortApplications = (
  poolSummary: RoundWithStakes | undefined,
  chainId: string | undefined,
  roundId: string | undefined,
  sortOption?: SortOption
) => {
  return useMemo(() => {
    if (!poolSummary || !chainId || !roundId) return [];
    const applications =
      poolSummary.applications.map((application) => {
        application.project.metadata = application.metadata.application.project;
        return application;
      }) ?? [];

    const mappedProjects = applications.map((app) => {
      return {
        ...app,
        totalStaked:
          Number(
            poolSummary.totalStakesByAnchorAddress[
              getAddress(app.anchorAddress ?? "")
            ] ?? 0
          ) / 1e18,
        uniqueDonorsCount: Number(app.uniqueDonorsCount),
        numberOfContributors: Number(app.totalDonationsCount),
        totalDonations: app.totalAmountDonatedInUsd,
      };
    });

    // Sort based on selected option and update ranks
    return sortProjects(mappedProjects, sortOption ?? "totalStakedDesc");
  }, [poolSummary, chainId, roundId, sortOption]);
};

export const sortProjects = (
  projects: ApplicationData[],
  sortOption: SortOption
): ApplicationData[] => {
  // First sort the projects
  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortOption) {
      case "totalStakedDesc":
        // If one has stakes and the other doesn't, the one with stakes ranks higher
        if (a.totalStaked > 0 && b.totalStaked === 0) return -1;
        if (b.totalStaked > 0 && a.totalStaked === 0) return 1;
        // If both have stakes, compare by stake amount
        if (a.totalStaked !== b.totalStaked) {
          return b.totalStaked - a.totalStaked;
        }
        // If stakes are equal, sort by contributor count
        return b.uniqueDonorsCount - a.uniqueDonorsCount;

      case "totalDonationsDesc":
        return b.totalDonations - a.totalDonations;

      case "totalContributorsDesc":
        return b.uniqueDonorsCount - a.uniqueDonorsCount;

      case "totalStakedAsc":
        return a.totalStaked - b.totalStaked;

      case "totalDonationsAsc":
        return a.totalDonations - b.totalDonations;

      case "totalContributorsAsc":
        return a.uniqueDonorsCount - b.uniqueDonorsCount;

      default:
        return 0;
    }
  });

  // Then update the ranks based on the new order
  return sortedProjects.map((project, index) => ({
    ...project,
    rank: index + 1,
  }));
};
