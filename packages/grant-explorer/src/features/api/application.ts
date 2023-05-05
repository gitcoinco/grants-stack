import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import { ERC20Contract, roundImplementationContract } from "./contracts";

export const voteOnRoundContract = async (
  roundId: string,
  signer: Signer,
  encodedVotes: BytesLike[],
  nativeTokenAmount: BigNumber
): Promise<{ txBlockNumber: number; txHash: string }> => {
  // checksum conversion
  roundId = ethers.utils.getAddress(roundId);

  const roundImplementation = new ethers.Contract(
    roundId,
    roundImplementationContract.abi,
    signer
  );

  const decodedValues = ethers.utils.defaultAbiCoder.decode(
    ["address", "uint256", "address", "bytes32", "uint256"],
    encodedVotes[0]
  );

  // only send native token amount as value to vote function
  nativeTokenAmount =
    decodedValues[0] === ethers.constants.AddressZero
      ? nativeTokenAmount
      : BigNumber.from(0);

  const tx = await roundImplementation.vote(encodedVotes, {
    value: nativeTokenAmount,
  });

  const receipt = await tx.wait();

  console.log("✅ Transaction hash: ", tx.hash);

  const blockNumber = receipt.blockNumber;
  return {
    txBlockNumber: blockNumber,
    txHash: tx.hash,
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

  // check if token is already approved
  const allowance = await tokenContract.allowance(
    signer.getAddress(),
    votingStrategy
  );

  if (allowance.gte(amount)) {
    console.log("✅ Token already approved");
    return;
  }

  const approveTx = await tokenContract.approve(votingStrategy, amount);

  await approveTx.wait();
};
