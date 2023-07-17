import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "ethers";
import {
  dgVotingStrategyDummyContract,
  qfVotingStrategyFactoryContract,
} from "../contracts";

/**
 * Deploys a QFVotingStrategy contract by invoking the
 * create on QuadraticFundingVotingStrategyFactory contract
 *
 * @param signerOrProvider
 * @returns
 */
export const deployVotingContract = async (
  signerOrProvider: Signer,
  isQF: boolean
): Promise<{ votingContractAddress: string }> => {
  try {
    const chainId = await signerOrProvider.getChainId();

    if (!isQF) {
      // Note: In direct-rounds, we use a dummy contract for the voting contract.
      return {
        votingContractAddress: dgVotingStrategyDummyContract(chainId),
      };
    }

    const _votingStrategyFactory = qfVotingStrategyFactoryContract(chainId);
    if (_votingStrategyFactory.address === undefined)
      throw new Error("No votingStrategyFactoryContract address");

    const votingStrategyFactory = new ethers.Contract(
      _votingStrategyFactory.address,
      _votingStrategyFactory.abi,
      signerOrProvider
    );

    // Deploy a new QF Voting Strategy contract
    const tx = await votingStrategyFactory.create();

    const receipt = await tx.wait();

    let votingContractAddress;

    if (receipt.events) {
      const event = receipt.events.find(
        (e: { event: string }) => e.event === "VotingContractCreated"
      );
      if (event && event.args) {
        votingContractAddress = event.args.votingContractAddress;
      }
    } else {
      throw new Error("No VotingContractCreated event");
    }

    console.log("✅ Voting Contract Transaction hash: ", tx.hash);
    console.log("✅ Voting Contract address: ", votingContractAddress);

    return { votingContractAddress };
  } catch (error) {
    console.error("deployQFVotingContract", error);
    throw new Error("Unable to create QF voting contract");
  }
};
