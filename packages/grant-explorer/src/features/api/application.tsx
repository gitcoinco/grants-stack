import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import { roundImplementationContract, ERC20Contract } from "./contracts";

export const voteOnRoundContract = async (
  roundId: string,
  signer: Signer,
  encodedVotes: BytesLike[]
): Promise<{ transactionBlockNumber: number }> => {

  // checksum conversion
  roundId = ethers.utils.getAddress(roundId);
  
  const roundImplementation = new ethers.Contract(
    roundId,
    roundImplementationContract.abi,
    signer
  );

  const tx = await roundImplementation.vote(
    encodedVotes
  );

  const receipt = await tx.wait();

  console.log("✅ Transaction hash: ", tx.hash);

  const blockNumber = receipt.blockNumber;
  return {
    transactionBlockNumber: blockNumber,
  };
};

export const approveTokenOnContract = async (
  signer: Signer,
  votingStrategy: string,
  tokenAddress: string,
  amount: BigNumber
): Promise<void> => {
  
  // checksum conversion
  votingStrategy = ethers.utils.getAddress(votingStrategy);
  tokenAddress = ethers.utils.getAddress(tokenAddress);

  const tokenContract = new ethers.Contract(
    tokenAddress,
    ERC20Contract.abi,
    signer
  );

  const approveTx = await tokenContract.approve(
    votingStrategy,
    amount
  );

  approveTx.wait();
};
