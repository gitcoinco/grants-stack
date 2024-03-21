import { ChainId } from "common";
import { BigNumber, Signer } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { directPayoutStrategyFactoryContract } from "../contracts";
import { MatchingStatsData } from "../types";
import { useApplicationsByRoundId } from "../../common/useApplicationsByRoundId";
import { Round } from "../types";

/**
 * Deploys a QFVotingStrategy contract by invoking the
 * create on QuadraticFundingVotingStrategyFactory contract
 *
 * @param signerOrProvider
 * @returns
 */

/**
 * @param signerOrProvider
 * @returns the factory address.
 */
export const getDirectPayoutFactoryAddress = async (
  signerOrProvider: Signer
): Promise<{ payoutContractAddress: string }> => {
  const chainId = await signerOrProvider.getChainId();
  const factoryAddress = directPayoutStrategyFactoryContract(chainId).address;
  return {
    payoutContractAddress: factoryAddress,
  };
};

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
            matchAmountInToken: BigNumber.from(
              matchingStatsData.matchAmountInToken
            ),
            originalMatchAmountInToken: BigNumber.from(
              matchingStatsData.originalMatchAmountInToken
            ),
            projectPayoutAddress: matchingStatsData.projectPayoutAddress,
          };
        }
      ) ?? [],
    [round.matchingDistribution?.matchingDistribution]
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
