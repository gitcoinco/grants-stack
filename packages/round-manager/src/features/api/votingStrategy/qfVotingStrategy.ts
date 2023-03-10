import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "ethers";
import { qfVotingStrategyFactoryContract } from "../contracts";

/**
 * Deploys a QFVotingStrategy contract by invoking the
 * create on QuadraticFundingVotingStrategyFactory contract
 *
 * @param signerOrProvider
 * @returns
 */
export const deployQFVotingContract = async (
  signerOrProvider: Signer
): Promise<{ votingContractAddress: string }> => {
  try {
    const chainId = await signerOrProvider.getChainId();

    const _QFVotingStrategyFactory = qfVotingStrategyFactoryContract(chainId); //roundFactoryContract(chainId);
    const qfVotingStrategyFactory = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _QFVotingStrategyFactory.address!,
      _QFVotingStrategyFactory.abi,
      signerOrProvider
    );

    // Deploy a new QF Voting Strategy contract
    const tx = await qfVotingStrategyFactory.create();

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
