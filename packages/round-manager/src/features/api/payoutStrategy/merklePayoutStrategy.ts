import { useFetchProjectPaidInRound, Payout } from "common";
import { useEffect, useState } from "react";
import { merklePayoutStrategyFactoryContract } from "../contracts";
import { fetchMatchingDistribution } from "../round";
import { MatchingStatsData } from "../types";
import { ChainId, generateMerkleTree } from "../utils";
import { usePublicClient, WalletClient } from "wagmi";
import { decodeEventLog, getContract, Hex } from "viem";
import MerklePayoutStrategyFactoryABI from "../abi/payoutStrategy/MerklePayoutStrategyFactoryABI";
import MerklePayoutStrategyImplementationABI from "../abi/payoutStrategy/MerklePayoutStrategyImplementationABI";
import merklePayoutStrategyImplementationABI from "../abi/payoutStrategy/MerklePayoutStrategyImplementationABI";
import { waitForTransaction } from "@wagmi/core";

/**
 * Deploys a QFVotingStrategy contract by invoking the
 * create on QuadraticFundingVotingStrategyFactory contract
 *
 * @param walletClient
 * @returns
 */
export const deployMerklePayoutStrategyContract = async (
  walletClient: WalletClient
): Promise<{ payoutContractAddress: string }> => {
  try {
    const chainId = await walletClient.getChainId();

    const _merklePayoutStrategyFactoryContract =
      merklePayoutStrategyFactoryContract(chainId);

    const payoutStrategyFactory = getContract({
      address: _merklePayoutStrategyFactoryContract.address as Hex,
      abi: MerklePayoutStrategyFactoryABI,
      walletClient,
    });

    // Deploy a new MerklePayoutStrategy contract
    const txHash = await payoutStrategyFactory.write.create();
    let payoutContractAddress = "";

    const data = await waitForTransaction({
      hash: txHash,
    });

    data.logs.find((log) => {
      const decoded = decodeEventLog({
        abi: MerklePayoutStrategyFactoryABI,
        ...log,
      });
      if (decoded.eventName === "PayoutContractCreated") {
        payoutContractAddress = decoded.args.payoutContractAddress as string;
      }
    });

    console.log("✅ Merkle Payout Transaction hash: ", txHash);
    console.log("✅ Merkle Payout Strategy address: ", payoutContractAddress);

    return { payoutContractAddress };
  } catch (error) {
    console.error("deployMerklePayoutStrategyContract", error);
    throw new Error("Unable to deploy merkle payout strategy contract");
  }
};

interface UpdateDistributionProps {
  payoutStrategy: string;
  encodedDistribution: string;
  walletClient: WalletClient;
}

export async function updateDistributionToContract({
  payoutStrategy,
  encodedDistribution,
  walletClient,
}: UpdateDistributionProps) {
  try {
    const merklePayoutStrategyImplementation = getContract({
      address: payoutStrategy as Hex,
      abi: MerklePayoutStrategyImplementationABI,
      walletClient,
    });

    const txHash =
      await merklePayoutStrategyImplementation.write.updateDistribution([
        encodedDistribution as Hex,
      ]);

    const txReceipt = await waitForTransaction({
      hash: txHash,
    });

    console.log("✅ Transaction hash: ", txHash);
    const blockNumber = txReceipt.blockNumber;
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
  const publicClient = usePublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matchingData, setMatchingData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const matchingDataRes = await fetchMatchingDistribution(
          roundId as string,
          publicClient
        );
        setMatchingData(matchingDataRes);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        console.error(error);
      }
    }

    fetchData();
  }, [roundId, publicClient]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const paidProjectsFromGraph = useFetchProjectPaidInRound(roundId, chainId);

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
  }, [allProjects, paidProjectsFromGraph]);
  return groupedProjects;
};

/**
 * Distributes funds to projects using merkle tree
 *
 * @param payoutStrategy
 * @param allProjects
 * @param projectIdsToBePaid
 * @param walletClient
 * @returns
 */
export const batchDistributeFunds = async (
  payoutStrategy: string,
  allProjects: MatchingStatsData[],
  projectIdsToBePaid: string[],
  walletClient: WalletClient
) => {
  try {
    const merklePayoutStrategyImplementation = getContract({
      address: payoutStrategy as Hex,
      abi: merklePayoutStrategyImplementationABI,
      walletClient,
    });

    // Generate merkle tree
    const { tree, matchingResults } = generateMerkleTree(allProjects);

    // Filter projects to be paid from matching results
    const projectsToBePaid = matchingResults.filter((project) =>
      projectIdsToBePaid.includes(project.projectId)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectsWithMerkleProof: any[] = [];

    projectsToBePaid.forEach((project) => {
      const distribution: [number, string, bigint, string] = [
        project.index as number,
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

    const tx = await merklePayoutStrategyImplementation.write.payout([
      projectsWithMerkleProof,
    ]);

    const receipt = await waitForTransaction({
      hash: tx,
    });

    console.log("✅ Transaction hash: ", tx);
    const blockNumber = receipt.blockNumber;
    return {
      transactionBlockNumber: blockNumber,
      error: undefined,
    };
  } catch (error) {
    console.error("batchDistributeFunds", error);

    return {
      transactionBlockNumber: BigInt(0),
      error,
    };
  }
};

/**
 * Reclaims funds from contract to provided address
 *
 * @param payoutStrategy
 * @param walletClient
 * @param recipient
 * @returns
 */
export async function reclaimFundsFromContract(
  payoutStrategy: string,
  walletClient: WalletClient,
  recipient: string
) {
  try {
    const merklePayoutStrategyImplementation = getContract({
      address: payoutStrategy as Hex,
      abi: MerklePayoutStrategyImplementationABI,
      walletClient,
    });

    const tx = await merklePayoutStrategyImplementation.write.withdrawFunds([
      recipient as Hex,
    ]);

    const receipt = await waitForTransaction({
      hash: tx,
    });

    console.log("✅ Transaction hash: ", tx);
    const blockNumber = receipt.blockNumber;
    return {
      transactionBlockNumber: blockNumber,
    };
  } catch (error) {
    console.error("reclaimFundsFromContract", error);
    throw new Error("Unable to reclaim funds from round");
  }
}
