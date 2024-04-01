import { Abi, ExtractAbiEventNames } from "abitype";
import ethers from "ethers";
import {
  Address,
  decodeEventLog,
  encodeEventTopics,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  GetEventArgs,
  Hex,
  Log,
  PublicClient,
  TransactionNotFoundError,
  WalletClient,
  zeroAddress,
} from "viem";

import { AlloError } from "./allo";
import { error, Result, success } from "./common";

export interface TransactionData {
  to: Hex;
  data?: Hex;
  value?: bigint;
}

export interface TransactionReceipt {
  transactionHash: Hex;
  blockHash: Hex;
  blockNumber: bigint;
  logs: Array<{
    data: Hex;
    topics: Hex[];
  }>;
  status: "success" | "reverted";
}

export interface TransactionSender {
  send(tx: TransactionData): Promise<Hex>;
  wait(
    txHash: Hex,
    timeout?: number,
    publicClient?: PublicClient
  ): Promise<TransactionReceipt>;
  address(): Promise<Address>;
}

export function decodeEventFromReceipt<
  TAbi extends Abi,
  TEventName extends ExtractAbiEventNames<TAbi>,
>(args: {
  receipt: TransactionReceipt;
  abi: TAbi;
  event: TEventName;
}): GetEventArgs<
  TAbi,
  TEventName,
  { EnableUnion: false; IndexedOnly: false; Required: true }
> {
  const data = encodeEventTopics({
    abi: args.abi as Abi,
    eventName: args.event as string,
  });

  const log = args.receipt.logs.find((log) => log.topics[0] === data[0]);

  if (log === undefined) {
    // should never happen
    throw new AlloError(
      `Event ${args.event} not found in transaction receipt, was the transaction successful?`
    );
  }

  const decoded = decodeEventLog({
    abi: args.abi as Abi,
    eventName: args.event as string,
    data: log.data,
    topics: log.topics as [Hex, ...Hex[]],
  });

  // typed at the function signature already
  return decoded.args as GetEventArgs<
    TAbi,
    TEventName,
    { EnableUnion: false; IndexedOnly: false; Required: true }
  >;
}

export function createEthersTransactionSender(
  signer: ethers.Signer,
  provider: ethers.providers.Provider
): TransactionSender {
  return {
    async send(tx: TransactionData): Promise<Hex> {
      const txResponse = await signer.sendTransaction({
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });

      return txResponse.hash as Hex;
    },

    async wait(txHash: Hex): Promise<TransactionReceipt> {
      const txReceipt = await provider.waitForTransaction(txHash);

      return {
        transactionHash: txReceipt.transactionHash as Hex,
        blockHash: txReceipt.blockHash as Hex,
        blockNumber: BigInt(txReceipt.blockNumber),
        logs: txReceipt.logs.map((log) => ({
          data: log.data as Hex,
          topics: log.topics as Hex[],
        })),
        status: txReceipt.status === 1 ? "success" : "reverted",
      };
    },

    async address(): Promise<Address> {
      return (await signer.getAddress()) as Address;
    },
  };
}

export function createViemTransactionSender(
  walletClient: WalletClient,
  publicClient: PublicClient
): TransactionSender {
  return {
    async send(tx: TransactionData): Promise<Hex> {
      const account = walletClient.account;

      if (!account)
        throw new Error(
          "createViemTransactionSender: walletClient.account is undefined"
        );

      const transactionHash = await walletClient.sendTransaction({
        account: account,
        to: tx.to,
        data: tx.data,
        value: tx.value,
        chain: null,
      });

      return transactionHash;
    },

    async wait(
      txHash: Hex,
      timeout?: number,
      customPublicClient?: PublicClient
    ): Promise<TransactionReceipt> {
      for (let i = 0; i < 5; i++) {
        try {
          const receipt = await (
            customPublicClient ?? publicClient
          ).waitForTransactionReceipt({
            hash: txHash,
            timeout: timeout,
          });

          return {
            transactionHash: receipt.transactionHash,
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            logs: receipt.logs.map((log: Log) => ({
              data: log.data,
              topics: log.topics,
            })),
            status: receipt.status,
          };
        } catch (e) {
          if (e instanceof TransactionNotFoundError) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          throw e;
        }
      }

      throw new Error("Transaction not found after 5 retries");
    },

    async address(): Promise<Address> {
      if (!walletClient.account || !walletClient.account.address) {
        throw new Error("createViemTransactionSender: address is undefined");
      }

      return walletClient?.account?.address;
    },
  };
}

/**
 *  @dev This is a mock transaction sender that does not actually send transactions. It is useful for testing.
 *
 *  @example
 *  const sender = createInMemoryTransactionSender();
 *  const txHash = await sender.send({
 *    to: "0x1234",
 *    data: "0x1234",
 *    value: 0n,
 *  });
 *  const receipt = await sender.wait(txHash);
 *  expect(receipt.transactionHash).toEqual(txHash);
 *  expect(sender.transactions).toEqual([
 *  {
 *    to: "0x1234",
 *    data: "0x1234",
 *    value: 0n,
 *  },
 *  ]);
 */
export function createMockTransactionSender(): TransactionSender & {
  sentTransactions: TransactionData[];
  clearTransactions(): void;
} {
  const sentTransactions: TransactionData[] = [];

  return {
    sentTransactions,

    clearTransactions(): void {
      sentTransactions.splice(0, sentTransactions.length);
    },

    async send(tx: TransactionData): Promise<Hex> {
      const txHash = ("0x" + "0".repeat(64)) as Hex;
      sentTransactions.push(tx);
      return txHash;
    },

    async wait(txHash: Hex): Promise<TransactionReceipt> {
      return {
        transactionHash: txHash,
        blockHash: `0x${Math.random().toString(16).slice(2)}` as Hex,
        blockNumber: BigInt(1),
        logs: [],
        status: "success",
      };
    },

    async address(): Promise<Address> {
      return zeroAddress;
    },
  };
}

export async function sendRawTransaction(
  sender: TransactionSender,
  args: TransactionData
): Promise<Result<Hex>> {
  try {
    const tx = await sender.send({
      to: args.to,
      data: args.data,
      value: args.value,
    });
    return success(tx);
  } catch (err) {
    return error(
      new AlloError(`Failed to send raw transaction: ${String(err)}`, err)
    );
  }
}

export async function sendTransaction<
  TAbi extends Abi,
  TFunctionName extends string,
>(
  sender: TransactionSender,
  args:
    | (EncodeFunctionDataParameters<TAbi, TFunctionName> & {
        address: Address;
      })
    | { address: Address; value: bigint }
    | { address: Address; data: Hex }
    | { address: Address; value: bigint; data: Hex }
): Promise<Result<Hex>> {
  try {
    let data;
    let value;

    if ("value" in args) {
      value = args.value;
    }

    if ("data" in args) {
      data = args.data;
    }

    if ("functionName" in args) {
      data = encodeFunctionData(args);
    }

    const tx = await sender.send({
      to: args.address,
      data: data,
      value: value,
    });

    return success(tx);
  } catch (err) {
    return error(
      new AlloError(`Failed to send transaction: ${String(err)}`, err)
    );
  }
}
