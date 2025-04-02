import { OrderByRounds, RoundCategory, RoundPayoutType, v2Project } from ".";

/**
 * Merges canonical and linked projects into a single array of projects
 * where linked projects are linked to their canonical project by chian ID.
 *
 * @param projects - Array of v2 projects
 *
 * @returns - Array of merged v2 projects
 */
export const mergeCanonicalAndLinkedProjects = (
  projects: v2Project[],
): v2Project[] => {
  const canonicalProjects = projects.filter(
    (project) => project.projectType === "canonical",
  );

  const linkedProjects = projects.filter(
    (project) => project.projectType === "linked",
  );
  const allProjects: Record<string, v2Project> = {};
  for (const project of canonicalProjects) {
    allProjects[project.id] = project;
  }

  for (const project of linkedProjects) {
    if (Object.prototype.hasOwnProperty.call(allProjects, project.id)) {
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

    case "allov2.EasyRetroFundingStrategy":
      return RoundCategory.Retrofunding;

    case "allov1.QF":
    case "allov2.DonationVotingMerkleDistributionDirectTransferStrategy":
      return RoundCategory.QuadraticFunding;
    default:
      throw new Error(`Unknown round strategy: ${name}`);
  }
};

export const orderByMapping: Record<
  OrderByRounds,
  { [key: string]: "ASC" | "DESC" }
> = {
  NATURAL: {},
  ID_ASC: { id: "ASC" },
  ID_DESC: { id: "DESC" },
  CHAIN_ID_ASC: { chainId: "ASC" },
  CHAIN_ID_DESC: { chainId: "DESC" },
  TAGS_ASC: { tags: "ASC" },
  TAGS_DESC: { tags: "DESC" },
  MATCH_AMOUNT_ASC: { matchAmount: "ASC" },
  MATCH_AMOUNT_DESC: { matchAmount: "DESC" },
  MATCH_TOKEN_ADDRESS_ASC: { matchTokenAddress: "ASC" },
  MATCH_TOKEN_ADDRESS_DESC: { matchTokenAddress: "DESC" },
  MATCH_AMOUNT_IN_USD_ASC: { matchAmountInUsd: "ASC" },
  MATCH_AMOUNT_IN_USD_DESC: { matchAmountInUsd: "DESC" },
  APPLICATION_METADATA_CID_ASC: { applicationMetadataCid: "ASC" },
  APPLICATION_METADATA_CID_DESC: { applicationMetadataCid: "DESC" },
  APPLICATION_METADATA_ASC: { applicationMetadata: "ASC" },
  APPLICATION_METADATA_DESC: { applicationMetadata: "DESC" },
  ROUND_METADATA_CID_ASC: { roundMetadataCid: "ASC" },
  ROUND_METADATA_CID_DESC: { roundMetadataCid: "DESC" },
  ROUND_METADATA_ASC: { roundMetadata: "ASC" },
  ROUND_METADATA_DESC: { roundMetadata: "DESC" },
  APPLICATIONS_START_TIME_ASC: { applicationsStartTime: "ASC" },
  APPLICATIONS_START_TIME_DESC: { applicationsStartTime: "DESC" },
  APPLICATIONS_END_TIME_ASC: { applicationsEndTime: "ASC" },
  APPLICATIONS_END_TIME_DESC: { applicationsEndTime: "DESC" },
  DONATIONS_START_TIME_ASC: { donationsStartTime: "ASC" },
  DONATIONS_START_TIME_DESC: { donationsStartTime: "DESC" },
  DONATIONS_END_TIME_ASC: { donationsEndTime: "ASC" },
  DONATIONS_END_TIME_DESC: { donationsEndTime: "DESC" },
  CREATED_AT_BLOCK_ASC: { createdAtBlock: "ASC" },
  CREATED_AT_BLOCK_DESC: { createdAtBlock: "DESC" },
  UPDATED_AT_BLOCK_ASC: { updatedAtBlock: "ASC" },
  UPDATED_AT_BLOCK_DESC: { updatedAtBlock: "DESC" },
  MANAGER_ROLE_ASC: { managerRole: "ASC" },
  MANAGER_ROLE_DESC: { managerRole: "DESC" },
  ADMIN_ROLE_ASC: { adminRole: "ASC" },
  ADMIN_ROLE_DESC: { adminRole: "DESC" },
  STRATEGY_ADDRESS_ASC: { strategyAddress: "ASC" },
  STRATEGY_ADDRESS_DESC: { strategyAddress: "DESC" },
  STRATEGY_ID_ASC: { strategyId: "ASC" },
  STRATEGY_ID_DESC: { strategyId: "DESC" },
  STRATEGY_NAME_ASC: { strategyName: "ASC" },
  STRATEGY_NAME_DESC: { strategyName: "DESC" },
  PROJECT_ID_ASC: { projectId: "ASC" },
  PROJECT_ID_DESC: { projectId: "DESC" },
  TOTAL_AMOUNT_DONATED_IN_USD_ASC: { totalAmountDonatedInUsd: "ASC" },
  TOTAL_AMOUNT_DONATED_IN_USD_DESC: { totalAmountDonatedInUsd: "DESC" },
  TOTAL_DONATIONS_COUNT_ASC: { totalDonationsCount: "ASC" },
  TOTAL_DONATIONS_COUNT_DESC: { totalDonationsCount: "DESC" },
  UNIQUE_DONORS_COUNT_ASC: { uniqueDonorsCount: "ASC" },
  UNIQUE_DONORS_COUNT_DESC: { uniqueDonorsCount: "DESC" },
  PRIMARY_KEY_ASC: { id: "ASC" },
  PRIMARY_KEY_DESC: { id: "DESC" },
};
