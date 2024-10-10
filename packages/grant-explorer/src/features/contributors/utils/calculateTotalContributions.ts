import { Hex } from "viem";
import { getTokenByChainIdAndAddress } from "common";
import { Contribution } from "data-layer";

export const calculateTotalContributions = (contributions?: Contribution[]) => {
  let totalDonations = 0;
  let totalUniqueContributions = 0;
  const projects: string[] = [];

  contributions?.forEach((contribution) => {
    const token = getTokenByChainIdAndAddress(
      contribution.chainId,
      contribution.tokenAddress as Hex
    );

    if (token) {
      totalDonations += contribution.amountInUsd;
      totalUniqueContributions += 1;
      const project = contribution.projectId;
      if (!projects.includes(project)) {
        projects.push(project);
      }
    }
  });

  return {
    totalDonations,
    totalUniqueContributions,
    totalProjectsFunded: projects.length,
  };
};
