import { Hex, encodeEventTopics, zeroAddress } from "viem";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ProjectRegistry from "../abis/allo-v1/ProjectRegistry";
import { Result, success } from "../common";
import {
  TransactionReceipt,
  createMockTransactionSender,
} from "../transaction-sender";
import { AlloV1 } from "./allo-v1";

const zeroTxHash = ("0x" + "0".repeat(64)) as Hex;
const ipfsUploader = vi.fn().mockResolvedValue(success("ipfsHash"));
const waitUntilIndexerSynced = vi.fn().mockResolvedValue(success(null));
const transactionSender = createMockTransactionSender();
const projectRegistryAddress = zeroAddress;
const chainId = 1;

describe("AlloV1", () => {
  let allo: AlloV1;
  let ipfsResult: Result<string>;
  let txResult: Result<`0x${string}`>;
  let txStatusResult: Result<TransactionReceipt>;
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
    const result = await allo
      .createProject({
        name: "My Project",
        metadata: { foo: "bar" },
      })
      .on("ipfs", (r) => (ipfsResult = r))
      .on("transaction", (r) => {
        txResult = r;

        // mock transaction receipt
        transactionSender.wait = vi.fn().mockResolvedValueOnce({
          transactionHash: zeroTxHash,
          blockNumber: 1n,
          blockHash: "0x0",
          logs: [
            {
              topics: encodeEventTopics({
                abi: ProjectRegistry,
                eventName: "ProjectCreated",
                args: {
                  projectID: 1n,
                  owner: zeroAddress,
                },
              }),
              data: "0x0",
            },
          ],
        });
      })
      .on("transactionStatus", (r) => (txStatusResult = r))
      .execute();

    expect(result).toEqual(
      success({
        projectId:
          "0xd0c4b8bf41dcf0607cd6c6d5f7c6423344ce99ddaaa72c31a7d8fb332a218878",
      })
    );
    expect(transactionSender.sentTransactions).toHaveLength(1);
    expect(ipfsResult!).toEqual(success("ipfsHash"));
    expect(txResult!).toEqual(success(zeroTxHash));
    expect(transactionSender.sentTransactions[0].to).toEqual(
      projectRegistryAddress
    );
    expect(txStatusResult!).toBeTruthy();
  });

  test("applyToRound", async () => {
    const result = await allo
      .applyToRoundV1({
        projectId: "0x123",
        roundId: "0x456",
        metadata: { foo: "bar" },
      })
      .on("ipfs", (r) => (ipfsResult = r))
      .on("transaction", (r) => {
        txResult = r;

        /** mock transaction receipt */
        transactionSender.wait = vi.fn().mockResolvedValueOnce({
          transactionHash: zeroTxHash,
          blockNumber: 1n,
          blockHash: "0x0",
          // todo: finish this
          logs: [],
        });
      })
      .on("transactionStatus", (r) => (txStatusResult = r))
      .execute();
  });
});
