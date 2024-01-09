import { Hex, PublicClient, WalletClient } from "viem";

export interface TransactionData {
  to: Hex;
  data: Hex;
  value: bigint;
}

export interface TransactionExecutorResult {
  transactionHash: Hex;
  wait: () => Promise<void>;
}

export type TransactionExecutor = (
  tx: TransactionData,
) => Promise<TransactionExecutorResult>;

export function createViemTransactionExecutor(
  walletClient: WalletClient,
  publicClient: PublicClient,
): TransactionExecutor {
  return async (tx: TransactionData) => {
    const [address] = await walletClient.getAddresses();

    const transactionHash = await walletClient.sendTransaction({
      account: address,
      to: tx.to,
      data: tx.data,
      value: tx.value,
      chain: null,
    });

    return {
      transactionHash,
      wait: async (): Promise<void> => {
        await publicClient.waitForTransactionReceipt({ hash: transactionHash });
        return;
      },
    };
  };
}
