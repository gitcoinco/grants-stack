import { ChainId, fetchProjectPaidInARound, Payout } from "common";
import { BigNumber, ethers, Signer } from "ethers";
import { useEffect, useState } from "react";
import { useWallet } from "../../common/Auth";
import { fetchMatchingDistribution } from "../round";
import { generateMerkleTree } from "../utils";
import {
  directPayoutStrategyFactoryContract,
  merklePayoutStrategyImplementationContract,
} from "../contracts";
import { MatchingStatsData } from "../types";

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

interface UpdateDistributionProps {
  payoutStrategy: string;
  encodedDistribution: string;
  signerOrProvider: Signer;
}

export async function updateDistributionToContract({
  payoutStrategy,
  encodedDistribution,
  signerOrProvider,
}: UpdateDistributionProps) {
  try {
    const merklePayoutStrategyImplementation = new ethers.Contract(
      payoutStrategy,
      merklePayoutStrategyImplementationContract.abi,
      signerOrProvider
    );

    const tx = await merklePayoutStrategyImplementation.updateDistribution(
      encodedDistribution
    );
    const receipt = await tx.wait();

    console.log("✅ Transaction hash: ", tx.hash);
    const blockNumber = receipt.blockNumber;
    return {
      transactionBlockNumber: blockNumber,
    };
  } catch (error) {
    console.error("updateDistributionToContract", error);
    throw new Error("Unable to finalize Round");
  }
}

export const useFetchMatchingDistributionFromContract = (
  roundId: string | undefined
): {
  distributionMetaPtr: string;
  matchingDistributionContract: MatchingStatsData[];
  isLoading: boolean;
  isError: boolean;
} => {
  const { provider: walletProvider } = useWallet();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matchingData, setMatchingData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const matchingDataRes = await fetchMatchingDistribution(
          roundId,
          walletProvider
        );
        setMatchingData(matchingDataRes);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        console.error(error);
      }
    }

    fetchData();
  }, [roundId, walletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    distributionMetaPtr: matchingData.distributionMetaPtr,
    matchingDistributionContract: matchingData.matchingDistribution,
    isLoading: isLoading,
    isError: isError,
  };
};

interface GroupedProjects {
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
  roundId: string
): GroupedProjects => {
  const [groupedProjects, setGroupedProjects] = useState<GroupedProjects>({
    paid: [],
    unpaid: [],
  });

  const paidProjectsFromGraph = fetchProjectPaidInARound(roundId, chainId);

  const allProjects =
    useFetchMatchingDistributionFromContract(
      roundId
    ).matchingDistributionContract;

  useEffect(() => {
    async function fetchData() {
      const groupedProjectsTmp: GroupedProjects = {
        paid: [],
        unpaid: [],
      };

      const paidProjects: Payout[] = await paidProjectsFromGraph;
      const paidProjectIds = paidProjects.map((project) => project.projectId);

      allProjects?.forEach((project) => {
        const projectStatus = paidProjectIds.includes(project.projectId)
          ? "paid"
          : "unpaid";

        let tmpProject = project;

        if (projectStatus === "paid") {
          tmpProject = {
            ...project,
            hash: paidProjects.find((p) => p.projectId === project.projectId)
              ?.txnHash,
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
  // TODO: Add txn hash and other needs
  return groupedProjects;
};

/**
 * Distributes funds to projects using merkle tree
 *
 * @param payoutStrategy
 * @param allProjects
 * @param projectIdsToBePaid
 * @param signerOrProvider
 * @returns
 */
export const batchDistributeFunds = async (
  payoutStrategy: string,
  allProjects: MatchingStatsData[],
  projectIdsToBePaid: string[],
  signerOrProvider: Signer
) => {
  try {
    const merklePayoutStrategyImplementation = new ethers.Contract(
      payoutStrategy,
      merklePayoutStrategyImplementationContract.abi,
      signerOrProvider
    );

    // Generate merkle tree
    const { tree, matchingResults } = generateMerkleTree(allProjects);

    // Filter projects to be paid from matching results
    const projectsToBePaid = matchingResults.filter((project) =>
      projectIdsToBePaid.includes(project.projectId)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectsWithMerkleProof: any[] = [];

    projectsToBePaid.forEach((project) => {
      const distribution: [number, string, BigNumber, string] = [
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        project.index!,
        project.projectPayoutAddress,
        project.matchAmountInToken,
        project.projectId,
      ];

      // Generate merkle proof
      const validMerkleProof = tree.getProof(distribution);

      projectsWithMerkleProof.push({
        index: distribution[0],
        grantee: distribution[1],
        amount: distribution[2],
        merkleProof: validMerkleProof,
        projectId: distribution[3],
      });
    });

    const tx = await merklePayoutStrategyImplementation[
      "payout((uint256,address,uint256,bytes32[],bytes32)[])"
    ](projectsWithMerkleProof);

    const receipt = await tx.wait();

    console.log("✅ Transaction hash: ", tx.hash);
    const blockNumber = receipt.blockNumber;
    return {
      transactionBlockNumber: blockNumber,
      error: undefined,
    };
  } catch (error) {
    console.error("batchDistributeFunds", error);

    return {
      transactionBlockNumber: 0,
      error,
    };
  }
};

/**
 * Reclaims funds from contract to provided address
 *
 * @param payoutStrategy
 * @param signerOrProvider
 * @param recipient
 * @returns
 */
export async function reclaimFundsFromContract(
  payoutStrategy: string,
  signerOrProvider: Signer,
  recipient: string
) {
  try {
    const merklePayoutStrategyImplementation = new ethers.Contract(
      payoutStrategy,
      merklePayoutStrategyImplementationContract.abi,
      signerOrProvider
    );

    const tx = await merklePayoutStrategyImplementation.withdrawFunds(
      recipient
    );

    const receipt = await tx.wait();

    console.log("✅ Transaction hash: ", tx.hash);
    const blockNumber = receipt.blockNumber;
    return {
      transactionBlockNumber: blockNumber,
    };
  } catch (error) {
    console.error("reclaimFundsFromContract", error);
    throw new Error("Unable to reclaim funds from round");
  }
}
