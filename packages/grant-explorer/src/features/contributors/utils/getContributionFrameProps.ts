import { Contribution } from "data-layer";
import { AttestationFrameProps, AttestationProject } from "../../api/types";

export const getContributionFrameProps = (
  contributions: Contribution[]
): AttestationFrameProps => {
  const allProjects: AttestationProject[] = [];
  const roundsSet = new Set<string>();
  const chainsSet = new Set<number>();
  const amountByRound: Record<
    string,
    {
      roundName: string;
      totalAmount: number;
    }
  > = {};

  // Process each contribution
  for (const contribution of contributions) {
    const projectName = contribution.application.project.name;
    const roundId = contribution.round.roundMetadata.name;
    const chainId = contribution.chainId;
    const amount = contribution.amountInUsd;

    // Store project details
    allProjects.push({
      rank: 0, // Rank will be calculated later
      name: projectName,
      round: roundId,
      image: contribution.application.project.metadata?.logoImg || "",
    });

    roundsSet.add(roundId);
    chainsSet.add(chainId);

    amountByRound[roundId] = amountByRound[roundId] || {
      roundName: contribution.round.roundMetadata.name,
      totalAmount: 0,
    };
    amountByRound[roundId].totalAmount += amount;
  }

  // Sort and rank projects by the amount in USD
  const topProjects = allProjects
    .sort((a, b) => Number(b.amount) - Number(a.amount)) // Sort by amount
    .slice(0, 3) // Get top 3
    .map((project, i) => ({
      ...project,
      rank: i + 1, // Assign rank starting from 1
    }));

  // Find the top round by total amount
  const topRound =
    Object.values(amountByRound).sort(
      (a, b) => b.totalAmount - a.totalAmount
    )[0]?.roundName || "";

  return {
    selectedBackground: "",
    topRound,
    projectsFunded: allProjects.length,
    roundsSupported: roundsSet.size,
    checkedOutChains: chainsSet.size,
    projects: topProjects,
  };
};
