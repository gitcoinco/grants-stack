import {
  Address,
  GetEventArgs,
  Hex,
  PublicClient,
  WalletClient,
  decodeEventLog,
  encodeEventTopics,
  encodeFunctionData,
} from "viem";
import ethers from "ethers";
import { Abi, ExtractAbiEventNames } from "abitype";

import { Result, error, success } from "./common";
import { AlloError } from "./allo";

export interface TransactionData {
  to: Hex;
  data: Hex;
  value: bigint;
}

export interface TransactionReceipt {
  transactionHash: Hex;
  blockHash: Hex;
  blockNumber: bigint;
  logs: Array<{
    data: Hex;
    topics: Hex[];
  }>;
}

export interface TransactionSender {
  send(tx: TransactionData): Promise<Hex>;
  wait(txHash: Hex): Promise<TransactionReceipt>;
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
    throw new Error("Event not found in receipt");
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
      };
    },
  };
}

export function createViemTransactionSender(
  walletClient: WalletClient,
  publicClient: PublicClient
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
        logs: receipt.logs.map((log) => ({
          data: log.data,
          topics: log.topics,
        })),
      };
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
        blockNumber: 1n,
        logs: [],
      };
    },
  };
}

export async function sendTransaction(
  sender: TransactionSender,
  args: Parameters<typeof encodeFunctionData>[0] & { address: Address }
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
      new AlloError(`Failed to send transaction: ${String(err)}`, err)
    );
  }
}
