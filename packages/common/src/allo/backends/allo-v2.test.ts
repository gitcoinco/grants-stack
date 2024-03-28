import {
  DirectGrantsStrategyAbi,
  DonationVotingMerkleDistributionDirectTransferStrategyAbi,
  RegistryAbi,
} from "@allo-team/allo-v2-sdk";
import { RoundCategory } from "data-layer";
import { Abi, Hex, encodeEventTopics, getAddress } from "viem";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Result, success } from "../common";
import {
  TransactionReceipt,
  createMockTransactionSender,
} from "../transaction-sender";
import { AlloV2 } from "./allo-v2";

const zeroTxHash = ("0x" + "0".repeat(64)) as Hex;
const ipfsUploader = vi.fn().mockResolvedValue(success("ipfsHash"));
const waitUntilIndexerSynced = vi.fn().mockResolvedValue(success(null));
const transactionSender = createMockTransactionSender();
const chainId = 1;

const profileCreationEvent = {
  indexed: {
    profileId:
      "0xf66d6cf2536a3922df72e0df157d29e505566a54d7decc0d40b856903d7934e4",
  },
  data: "0x0000000000000000000000000000000000000000000000000000000000001e6600000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000bbeeed010f67978d410cefdb416ca5f0207fad9c000000000000000000000000f839f6561167a018c0f488e05c2e65bbf0fbd628000000000000000000000000000000000000000000000000000000000000000f4d7920746573742070726f66696c65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002e516d5339586946734371324e673662754a6d424c764e574e70637348733475594268566d4266534b32444670736d000000000000000000000000000000000000",
};

const roundApplicationEvent = {
  indexed: {
    recipientId: "0x8C180840fcBb90CE8464B4eCd12ab0f840c6647C",
  },
  data: "0x0000000000000000000000000000000000000000000000000000000000001e6600000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000bbeeed010f67978d410cefdb416ca5f0207fad9c000000000000000000000000f839f6561167a018c0f488e05c2e65bbf0fbd628000000000000000000000000000000000000000000000000000000000000000f4d7920746573742070726f66696c65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002e516d5339586946734371324e673662754a6d424c764e574e70637348733475594268566d4266534b32444670736d000000000000000000000000000000000000",
};

describe("AlloV2", () => {
  let allo: AlloV2;
  let ipfsResult: Result<string>;
  let txResult: Result<`0x${string}`>;
  let txStatusResult: Result<TransactionReceipt>;

  beforeEach(() => {
    allo = new AlloV2({
      chainId,
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
        memberAddresses: [],
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
                abi: RegistryAbi as Abi,
                eventName: "ProfileCreated",
                args: {
                  profileId: profileCreationEvent.indexed.profileId as Hex,
                },
              }),
              data: profileCreationEvent.data,
            },
          ],
        });
      })
      .on("transactionStatus", (r) => (txStatusResult = r))
      .execute();

    expect(result).toEqual(
      success({
        projectId: profileCreationEvent.indexed.profileId as Hex,
      })
    );
    expect(transactionSender.sentTransactions).toHaveLength(1);
    expect(ipfsResult!).toEqual(success("ipfsHash"));
    expect(txResult!).toEqual(success(zeroTxHash));
    getAddress(transactionSender.sentTransactions[0].to.toLowerCase());
    expect(txStatusResult!).toBeTruthy();
  });

  test("applyToRound DonationVotingMerkleDistributionDirectTransferStrategy", async () => {
    const result = await allo
      .applyToRound({
        projectId: "0x8C180840fcBb90CE8464B4eCd12ab0f840c6647C",
        roundId: 88,
        metadata: {
          application: {
            recipient: "0x8C180840fcBb90CE8464B4eCd12ab0f840c6647C",
          },
        },
        strategy: RoundCategory.QuadraticFunding,
      })
      .on("ipfs", (r) => (ipfsResult = r))
      .on("transaction", (r) => {
        txResult = r;

        /** mock transaction receipt */
        transactionSender.wait = vi.fn().mockResolvedValueOnce({
          transactionHash: zeroTxHash,
          blockNumber: 1n,
          blockHash: "0x0",
          logs: [
            {
              topics: encodeEventTopics({
                abi: DonationVotingMerkleDistributionDirectTransferStrategyAbi,
                eventName: "Registered",
                args: {
                  recipientId: roundApplicationEvent.indexed.recipientId as Hex,
                },
              }),
              data: roundApplicationEvent.data,
            },
          ],
        });
      })
      .on("transactionStatus", (r) => (txStatusResult = r))
      .execute();

    expect(result.type).not.toEqual("error");

    expect(transactionSender.sentTransactions).toHaveLength(2);
    expect(transactionSender.sentTransactions[0].to.toLowerCase()).toEqual(
      "0x4aacca72145e1df2aec137e1f3c5e3d75db8b5f3".toLocaleLowerCase()
    );
    expect(txResult!).toEqual(success(zeroTxHash));
    expect(txStatusResult).toBeTruthy();
  });

  test("applyToRound DirectGrantsStrategy", async () => {
    const result = await allo
      .applyToRound({
        projectId: "0x8C180840fcBb90CE8464B4eCd12ab0f840c6647C",
        roundId: 99,
        metadata: {
          application: {
            recipient: "0x8C180840fcBb90CE8464B4eCd12ab0f840c6647C",
            answers: [],
          },
        },
        strategy: RoundCategory.Direct,
      })
      .on("ipfs", (r) => (ipfsResult = r))
      .on("transaction", (r) => {
        txResult = r;

        /** mock transaction receipt */
        transactionSender.wait = vi.fn().mockResolvedValueOnce({
          transactionHash: zeroTxHash,
          blockNumber: 1n,
          blockHash: "0x0",
          logs: [
            {
              topics: encodeEventTopics({
                abi: DirectGrantsStrategyAbi,
                eventName: "Registered",
                args: {
                  recipientId: roundApplicationEvent.indexed.recipientId as Hex,
                },
              }),
              data: roundApplicationEvent.data,
            },
          ],
        });
      })
      .on("transactionStatus", (r) => (txStatusResult = r))
      .execute();

    expect(result.type).not.toEqual("error");

    expect(transactionSender.sentTransactions).toHaveLength(3);
    expect(transactionSender.sentTransactions[0].to.toLowerCase()).toEqual(
      "0x4aacca72145e1df2aec137e1f3c5e3d75db8b5f3".toLocaleLowerCase()
    );
    expect(txResult!).toEqual(success(zeroTxHash));
    expect(txStatusResult).toBeTruthy();
  });
});
