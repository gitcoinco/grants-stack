import { qfVotingStrategyFactoryContract } from "../contracts";
import { WalletClient } from "wagmi";
import { decodeEventLog, getContract, Hex } from "viem";
import { waitForTransaction } from "@wagmi/core";
import QFVotingStrategyFactoryABI from "../abi/votingStrategy/QFVotingStrategyFactoryABI";

/**
 * Deploys a QFVotingStrategy contract by invoking the
 * create on QuadraticFundingVotingStrategyFactory contract
 *
 * @param walletClient
 * @param publicClient
 * @returns
 */
export const deployQFVotingContract = async (
  walletClient: WalletClient
): Promise<{ votingContractAddress: string }> => {
  try {
    const chainId = await walletClient.getChainId();

    const _QFVotingStrategyFactory = qfVotingStrategyFactoryContract(chainId); //roundFactoryContract(chainId);
    const qfVotingStrategyFactory = getContract({
      address: _QFVotingStrategyFactory.address as Hex,
      abi: QFVotingStrategyFactoryABI,
      walletClient,
    });

    const txHash = await qfVotingStrategyFactory.write.create();

    const receipt = await waitForTransaction({
      hash: txHash,
    });

    let votingContractAddress = "";
    receipt.logs
      .map((log) => decodeEventLog({ ...log, abi: QFVotingStrategyFactoryABI }))
      .find((log) => {
        if (log.eventName === "VotingContractCreated") {
          votingContractAddress = log.args.votingContractAddress as string;
        }
      });

    console.log("✅ Voting Contract Transaction hash: ", txHash);
    console.log("✅ Voting Contract address: ", votingContractAddress);

    return { votingContractAddress: votingContractAddress };
  } catch (error) {
    console.error("deployQFVotingContract", error);
    throw new Error("Unable to create QF voting contract");
  }
};
