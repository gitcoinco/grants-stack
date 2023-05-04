import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import { ERC20Contract, roundImplementationContract } from "./contracts";

export const voteOnRoundContract = async (
  roundId: string,
  signer: Signer,
  encodedVotes: BytesLike[],
  nativeTokenAmount = 0
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
    decodedValues[0] === ethers.constants.AddressZero ? nativeTokenAmount : 0;

  const amountInWei = ethers.utils.parseUnits(
    nativeTokenAmount.toString(),
    "ether"
  );

  const gasPrice = await signer.getGasPrice();
  const gasLimit = await roundImplementation.estimateGas.vote(encodedVotes, {
    value: amountInWei,
  });
  const gasLimitWithBuffer = gasLimit.mul(2); // increase gas limit by 2x

  const tx = await roundImplementation.vote(encodedVotes, {
    value: amountInWei,
    gasPrice,
    gasLimit: gasLimitWithBuffer,
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

  const gasPrice = await signer.getGasPrice();
  const gasLimit = await tokenContract.estimateGas.approve(
    votingStrategy,
    amount
  );
  const gasLimitWithBuffer = gasLimit.mul(2); // increase gas limit by 2x

  const approveTx = await tokenContract.approve(votingStrategy, amount, {
    gasPrice,
    gasLimit: gasLimitWithBuffer,
  });

  await approveTx.wait();
};
