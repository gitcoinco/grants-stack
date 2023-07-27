import { BigNumber, BytesLike, ethers, Signer } from "ethers";
import { ERC20Contract } from "./contracts";
import { handleTransaction } from "common/src/transactions";
import { multiRoundCheckoutContract } from "./contracts";

export const voteOnRoundContract = async (
  signer: Signer,
  token: string,
  groupedVotes: Record<string, BytesLike[]>,
  groupedAmounts: Record<string, BigNumber>,
  nativeTokenAmount: BigNumber
): Promise<{ txBlockNumber: number; txHash: string }> => {
  const mrcImplementation = new ethers.Contract(
    multiRoundCheckoutContract.address as string,
    multiRoundCheckoutContract.abi,
    signer
  );
  debugger;
  const tx = await mrcImplementation.vote(
    Object.values(groupedVotes),
    Object.keys(groupedVotes),
    Object.values(groupedAmounts),
    {
      value: nativeTokenAmount,
    }
  );

  const result = await handleTransaction(tx);

  if (result.error) {
    // handle error case
    throw new Error(result.error);
  } else {
    console.log("✅ Transaction hash: ", result.txHash);

    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      txBlockNumber: result.txBlockNumber!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      txHash: result.txHash!,
    };
  }
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

  const result = await handleTransaction(approveTx);

  if (result.error) {
    // handle error case
    throw new Error(result.error);
  } else {
    console.log("✅ Transaction hash: ", result.txHash);
  }
};
