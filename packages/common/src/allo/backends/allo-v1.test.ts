import { beforeEach, describe, expect, test, vi } from "vitest";
import { AlloV1 } from "./allo-v1";
import { encodeEventTopics, Hex, zeroAddress } from "viem";
import {
  createMockTransactionSender,
  TransactionReceipt,
} from "../transaction-sender";
import { Result, success } from "../common";
import ProjectRegistry from "../abis/allo-v1/ProjectRegistry";

const zeroTxHash = ("0x" + "0".repeat(64)) as Hex;
const ipfsUploader = vi.fn().mockResolvedValue(success("ipfsHash"));
const waitUntilIndexerSynced = vi.fn().mockResolvedValue(success(null));
const transactionSender = createMockTransactionSender();
const chainId = 1;

describe("AlloV1", () => {
  let allo: AlloV1;
  beforeEach(() => {
    allo = new AlloV1({
      chainId,
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
          "0xa0affa31521afe084aee15c3ff5570c600b014cae2a9c45a9cc1e50b0c9852e5",
      })
    );
    expect(transactionSender.sentTransactions).toHaveLength(1);
    expect(ipfsResult!).toEqual(success("ipfsHash"));
    expect(txResult!).toEqual(success(zeroTxHash));
    expect(txStatusResult!).toBeTruthy();
  });
});
