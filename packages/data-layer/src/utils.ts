import { RoundCategory, RoundPayoutType, v2Project } from ".";

/**
 * Merges canonical and linked projects into a single array of projects
 * where linked projects are linked to their canonical project by chian ID.
 *
 * @param projects - Array of v2 projects
 *
 * @returns - Array of merged v2 projects
 */
export const mergeCanonicalAndLinkedProjects = (projects: v2Project[]) => {
  const canonicalProjects = projects.filter(
    (project) => project.projectType === "CANONICAL",
  );

  const linkedProjects = projects.filter(
    (project) => project.projectType === "LINKED",
  );
  const allProjects: Record<string, v2Project> = {};
  for (const project of canonicalProjects) {
    allProjects[project.id] = project;
  }

  for (const project of linkedProjects) {
    if (allProjects[project.id]) {
      if (!allProjects[project.id].linkedChains) {
        allProjects[project.id].linkedChains = [];
      }
      allProjects[project.id].linkedChains?.push(project.chainId);
    }
  }

  return Object.values(allProjects);
};

export const strategyNameToCategory = (
  name: RoundPayoutType | string,
): RoundCategory => {
  switch (name) {
    case "allov1.Direct":
    case "allov2.DirectGrantsSimpleStrategy":
    case "allov2.DirectGrantsLiteStrategy":
      return RoundCategory.Direct;

    case "allov1.QF":
    case "allov2.DonationVotingMerkleDistributionDirectTransferStrategy":
      return RoundCategory.QuadraticFunding;
    default:
      throw new Error(`Unknown round strategy: ${name}`);
  }
};
