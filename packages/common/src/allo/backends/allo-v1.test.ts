import { describe, test, expect, vi, beforeEach } from "vitest";
import { AlloV1 } from "./allo-v1";
import { zeroAddress, Hex } from "viem";
import {
  TransactionReceipt,
  createMockTransactionSender,
} from "../transaction-sender";
import { Result, success } from "../common";

const zeroTxHash = ("0x" + "0".repeat(64)) as Hex;
const ipfsUploader = vi.fn().mockResolvedValue(success("ipfsHash"));
const waitUntilIndexerSynced = vi.fn().mockResolvedValue(success(null));
const transactionSender = createMockTransactionSender();
const projectRegistryAddress = zeroAddress;
const chainId = 1;

describe("AlloV1", () => {
  let allo: AlloV1;
  beforeEach(() => {
    allo = new AlloV1({
      chainId,
      projectRegistryAddress,
      ipfsUploader,
      transactionSender,
      waitUntilIndexerSynced,
    });
  });

  test("createProject", async () => {
    let ipfsResult: Result<string>;
    let txResult: Result<`0x${string}`>;
    let txStatusResult: Result<TransactionReceipt>;

    const result = await allo
      .createProject({
        name: "My Project",
        metadata: { foo: "bar" },
      })
      .on("ipfs", (r) => (ipfsResult = r))
      .on("transaction", (r) => (txResult = r))
      .on("transactionStatus", (r) => (txStatusResult = r))
      .execute();

    expect(result).toEqual(success({ projectId: 0n }));
    expect(transactionSender.sentTransactions).toHaveLength(1);
    expect(ipfsResult!).toEqual(success("ipfsHash"));
    expect(txResult!).toEqual(success(zeroTxHash));
    expect(transactionSender.sentTransactions[0].to).toEqual(
      projectRegistryAddress
    );
    expect(txStatusResult!).toBeTruthy();
  });
});
