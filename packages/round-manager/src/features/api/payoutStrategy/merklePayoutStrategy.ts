import { ethers, Signer } from "ethers";
import { useState, useEffect } from "react";
import { useWallet } from "../../common/Auth";
import {
  merklePayoutStrategyImplementationContract,
  merklePayoutStrategyFactoryContract
} from "../contracts";
import { fetchMatchingDistribution } from "../round";
import { MatchingStatsData } from "../types";

/**
 * Deploys a QFVotingStrategy contract by invoking the
 * create on QuadraticFundingVotingStrategyFactory contract
 *
 * @param signerOrProvider
 * @returns
 */
export const deployMerklePayoutStrategyContract = async (
  signerOrProvider: Signer
): Promise<{ payoutContractAddress: string }> => {
  try {
    const chainId = await signerOrProvider.getChainId();

    const _merklePayoutStrategyFactoryContract =
      merklePayoutStrategyFactoryContract(chainId);

    const payoutStrategyFactory = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _merklePayoutStrategyFactoryContract.address!,
      _merklePayoutStrategyFactoryContract.abi,
      signerOrProvider
    );

    // Deploy a new MerklePayoutStrategy contract
    const tx = await payoutStrategyFactory.create();

    const receipt = await tx.wait();

    let payoutContractAddress;

    if (receipt.events) {
      const event = receipt.events.find(
        (e: { event: string }) => e.event === "PayoutContractCreated"
      );
      if (event && event.args) {
        payoutContractAddress = event.args.payoutContractAddress;
      }
    } else {
      throw new Error("No PayoutContractCreated event");
    }

    console.log("✅ Merkle Payout Transaction hash: ", tx.hash);
    console.log("✅ Merkle Payout Strategy address: ", payoutContractAddress);

    return { payoutContractAddress };
  } catch (error) {
    console.error("deployMerklePayoutStrategyContract", error);
    throw new Error("Unable to deploy merkle payout strategy contract");
  }
};

interface UpdateDistributionProps {
  payoutContract: string;
  encodedDistribution: string;
  signerOrProvider: Signer;
}

export async function updateDistributionToContract({
  payoutContract,
  encodedDistribution,
  signerOrProvider,
}: UpdateDistributionProps) {
  try {
    const merklePayoutStrategyImplementation = new ethers.Contract(
      payoutContract,
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