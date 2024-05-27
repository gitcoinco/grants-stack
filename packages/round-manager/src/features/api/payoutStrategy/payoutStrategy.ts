import { ChainId } from "common";
import { useEffect, useMemo, useState } from "react";
import { MatchingStatsData } from "../types";
import { useApplicationsByRoundId } from "../../common/useApplicationsByRoundId";
import { Round } from "../types";

interface GroupedProjects {
  all: MatchingStatsData[];
  paid: MatchingStatsData[];
  unpaid: MatchingStatsData[];
}

/**
 * Groups projects by payment status
 * @param roundId Round ID
 * @param chainId Chain ID
 * @returns GroupedProjects
 */
export const useGroupProjectsByPaymentStatus = (
  chainId: ChainId,
  round: Round
): GroupedProjects => {
  const [groupedProjects, setGroupedProjects] = useState<GroupedProjects>({
    paid: [],
    all: [],
    unpaid: [],
  });

  const { data: applications } = useApplicationsByRoundId(round.id);

  const paidProjects = applications
    ?.filter((application) => application.distributionTransaction !== null)
    .map((application) => ({
      projectId: application.projectId,
      distributionTransaction: application.distributionTransaction,
    }));

  const paidProjectIds = paidProjects?.map((project) => project.projectId);

  const allProjects: MatchingStatsData[] = useMemo(
    () =>
      round.matchingDistribution?.matchingDistribution.map(
        (matchingStatsData) => {
          return {
            projectName: matchingStatsData.projectName,
            contributionsCount: matchingStatsData.contributionsCount,
            matchPoolPercentage: matchingStatsData.matchPoolPercentage,
            projectId: matchingStatsData.projectId,
            applicationId: matchingStatsData.applicationId,
            anchorAddress: applications?.find(
              (application) =>
                application.projectId === matchingStatsData.projectId
            )?.anchorAddress,
            matchAmountInToken: BigInt(
              matchingStatsData.matchAmountInToken
            ),
            originalMatchAmountInToken: BigInt(
              matchingStatsData.originalMatchAmountInToken
            ),
            projectPayoutAddress: matchingStatsData.projectPayoutAddress,
          };
        }
      ) ?? [],
    [round.matchingDistribution?.matchingDistribution, applications]
  );

  useEffect(() => {
    async function fetchData() {
      const groupedProjectsTmp: GroupedProjects = {
        all: allProjects,
        paid: [],
        unpaid: [],
      };

      allProjects?.forEach((project) => {
        const projectStatus = paidProjectIds?.includes(project.projectId)
          ? "paid"
          : "unpaid";

        let tmpProject = project;

        if (projectStatus === "paid") {
          tmpProject = {
            ...project,
            hash:
              paidProjects?.find((p) => p.projectId === project.projectId)
                ?.distributionTransaction || undefined,
            status: "",
          };
        }
        groupedProjectsTmp[projectStatus].push(tmpProject);
      });

      setGroupedProjects(groupedProjectsTmp);
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProjects]);
  return groupedProjects;
};
