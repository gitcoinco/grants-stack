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
  WalletClient,
  zeroAddress,
} from "viem";

import { AlloError } from "./allo";
import { error, Result, success } from "./common";

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

    async wait(txHash: Hex): Promise<TransactionReceipt> {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      return {
        transactionHash: receipt.transactionHash,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        logs: receipt.logs.map((log: Log) => ({
          data: log.data,
          topics: log.topics,
        })),
      };
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
  args: EncodeFunctionDataParameters<TAbi, TFunctionName> & { address: Address }
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
