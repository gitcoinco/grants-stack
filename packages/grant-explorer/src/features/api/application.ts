import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import { roundImplementationContract, ERC20Contract } from "./contracts";

export const voteOnRoundContract = async (
  roundId: string,
  signer: Signer,
  encodedVotes: BytesLike[],
  nativeTokenAmount = 0
): Promise<{ txBlockNumber: number, txHash: string }> => {
  // checksum conversion
  roundId = ethers.utils.getAddress(roundId);

  const roundImplementation = new ethers.Contract(
    roundId,
    roundImplementationContract.abi,
    signer
  );

  const decodedValues = ethers.utils.defaultAbiCoder.decode(
    ["address", "uint256", "address"],
    encodedVotes[0]
  );

  // only send native token amount as value to vote function
  nativeTokenAmount =
    decodedValues[0] === ethers.constants.AddressZero ? nativeTokenAmount : 0;

  const amountInWei = ethers.utils.parseUnits(
    nativeTokenAmount.toString(),
    "ether"
  );

  const tx = await roundImplementation.vote(encodedVotes, {
    value: amountInWei,
  });

  const receipt = await tx.wait();

  console.log("✅ Transaction hash: ", tx.hash);

  const blockNumber = receipt.blockNumber;
  return {
    txBlockNumber: blockNumber,
    txHash: tx.hash
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

  const approveTx = await tokenContract.approve(votingStrategy, amount);

  await approveTx.wait();
};
