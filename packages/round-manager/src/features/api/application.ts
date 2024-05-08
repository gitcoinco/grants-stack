import { ERC20Contract } from "./contracts";
import { BigNumber } from "ethers";
import { ethers } from "ethers";
import { Signer } from "@ethersproject/abstract-signer";
import { PayoutToken } from "./payoutTokens";

export const fundRoundContract = async (
  roundId: string,
  signer: Signer,
  payoutToken: PayoutToken,
  amount: BigNumber
): Promise<{ txBlockNumber: number; txHash: string }> => {
  // checksum conversion
  roundId = ethers.utils.getAddress(roundId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let receipt: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tx: any = {};

  if (payoutToken.address === ethers.constants.AddressZero) {
    const txObj = {
      to: roundId,
      value: amount,
    };

    tx = await signer.sendTransaction(txObj);

    receipt = await tx.wait();
  } else {
    const tokenContract = new ethers.Contract(
      payoutToken.address,
      ERC20Contract.abi,
      signer
    );

    tx = await tokenContract.transfer(roundId, amount);

    receipt = await tx.wait();
  }

  console.log("✅ Transaction hash: ", tx.hash);

  const blockNumber = receipt.blockNumber;
  return {
    txBlockNumber: blockNumber,
    txHash: tx.hash,
  };
};

export const approveTokenOnContract = async (
  signer: Signer,
  roundId: string,
  tokenAddress: string,
  amount: BigNumber
): Promise<void> => {
  // checksum conversion
  roundId = ethers.utils.getAddress(roundId);
  tokenAddress = ethers.utils.getAddress(tokenAddress);

  const tokenContract = new ethers.Contract(
    tokenAddress,
    ERC20Contract.abi,
    signer
  );

  const approveTx = await tokenContract.approve(roundId, amount);

  await approveTx.wait();
};
