import { ethers, Signer } from "ethers";
import { merklePayoutStrategyFactoryContract } from "../contracts";

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

    const payoutStrategyFactory = new ethers.ContractFactory(
      _merklePayoutStrategyFactoryContract.abi,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _merklePayoutStrategyFactoryContract.bytecode!,
      signerOrProvider
    );

    // Deploy a new MerklePayoutStrategy contract
    const payoutStrategyContract = await payoutStrategyFactory.deploy();

    const receipt = await payoutStrategyContract.deployTransaction.wait();
    const payoutContractAddress = payoutStrategyContract.address;

    console.log("✅ Merkle Payout Transaction hash: ", receipt.transactionHash);
    console.log("✅ Merkle Payout Strategy address: ", payoutContractAddress);

    return { payoutContractAddress };
  } catch (error) {
    console.error("deployMerklePayoutStrategyContract", error);
    throw new Error("Unable to deploy merkle payout strategy contract");
  }
};
