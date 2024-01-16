import { describe, test, expect, vi, beforeEach } from "vitest";
import { AlloV1 } from "./allo-v1";
import { zeroAddress, Hex, encodeEventTopics } from "viem";
import {
  TransactionReceipt,
  createMockTransactionSender,
} from "../transaction-sender";
import { Result, success } from "../common";
import ProjectRegistry from "../abis/allo-v1/ProjectRegistry";

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
      .on("transaction", (r) => {
        txResult = r;

        // mock transaction receipt
        transactionSender.wait = vi.fn().mockResolvedValueOnce({
          transactionHash: zeroTxHash,
          blockNumber: BigInt(1),
          blockHash: "0x0",
          logs: [
            {
              topics: encodeEventTopics({
                abi: ProjectRegistry,
                eventName: "ProjectCreated",
                args: {
                  projectID: BigInt(1),
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
});
