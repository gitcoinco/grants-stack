import { ethers } from "ethers";
import { qfRelayStrategyFactoryContract } from "../contracts";
import { Signer } from "@ethersproject/abstract-signer";

/**
 * Deploys a QFVotingStrategy contract by invoking the
 * create on QuadraticFundingVotingStrategyFactory contract
 *
 * @param signerOrProvider
 * @returns
 */
export const deployQFRelayContract = async (
  signerOrProvider: Signer
): Promise<{ votingContractAddress: string }> => {
  try {
    const chainId = await signerOrProvider.getChainId();

    const _QFVRelayStrategyFactory = qfRelayStrategyFactoryContract(chainId); //roundFactoryContract(chainId);
    const qfRelayStrategyFactory = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _QFVRelayStrategyFactory.address!,
      _QFVRelayStrategyFactory.abi,
      signerOrProvider
    );

    // Deploy a new QF Voting Strategy contract
    const tx = await qfRelayStrategyFactory.create();

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
    console.error("deployQFRelayContract", error);
    throw new Error("Unable to create QF voting relay contract");
  }
};
