import {
  Address,
  Hex,
  PublicClient,
  WalletClient,
  encodeFunctionData,
} from "viem";
import { Result, error, success } from "./common";
import { AlloError } from ".";

export interface TransactionData {
  to: Hex;
  data: Hex;
  value: bigint;
}

export interface TransactionReceipt {
  transactionHash: Hex;
  blockHash: Hex;
  blockNumber: bigint;
}

export interface TransactionSender {
  send(tx: TransactionData): Promise<Hex>;
  wait(txHash: Hex): Promise<TransactionReceipt>;
}

export function createViemTransactionSender(
  walletClient: WalletClient,
  publicClient: PublicClient,
): TransactionSender {
  return {
    async send(tx: TransactionData): Promise<Hex> {
      const [address] = await walletClient.getAddresses();

      const transactionHash = await walletClient.sendTransaction({
        account: address,
        to: tx.to,
        data: tx.data,
        value: tx.value,
        chain: null,
      });

      return transactionHash;
    },

    async wait(txHash: Hex): Promise<TransactionReceipt> {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      return {
        transactionHash: receipt.transactionHash,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
      };
    },
  };
}

export async function sendTransaction(
  sender: TransactionSender,
  args: Parameters<typeof encodeFunctionData>[0] & { address: Address },
): Promise<Result<Hex>> {
  try {
    const data = encodeFunctionData(args);

    const tx = await sender.send({
      to: args.address,
      data: data,
      value: 0n,
    });

    return success(tx);
  } catch (err) {
    return error(
      new AlloError(`Failed to send transaction: ${String(err)}`, err),
    );
  }
}
