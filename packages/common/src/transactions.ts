import { TransactionResponse } from "@ethersproject/providers";
import { Logger } from "ethers/lib/utils";

export type TransactionResult =
  | {
      error: string;
      txHash?: undefined;
      txBlockNumber?: undefined;
    }
  | {
      txHash: string;
      txBlockNumber: number;
      error: undefined;
    };

// This function is used to handle replaced transactions
export const handleTransaction = async (
  tx: TransactionResponse
): Promise<TransactionResult> => {
  try {
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    // The transactions was mined without issue
    return {
      txHash: tx.hash,
      txBlockNumber: receipt.blockNumber,
      error: undefined,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === Logger.errors.TRANSACTION_REPLACED) {
      if (error.cancelled) {
        return { error: "Transaction was cancelled" };
      } else {
        // The user used "speed up" or something similar
        // in their client, but we now have the updated info
        console.log("➡️ Transaction replaced: ", error.replacement.hash);
        return {
          txHash: error.replacement.hash,
          txBlockNumber: error.receipt.blockNumber,
          error: undefined,
        };
      }
    } else {
      return { error: "Unknown Transaction Error" };
    }
  }
};
