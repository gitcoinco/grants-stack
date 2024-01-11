import { Address, Hex } from "viem";
import { Allo, AlloError, AlloOperation } from "../allo";
import {
  TransactionReceipt,
  TransactionSender,
  sendTransaction,
} from "../transaction-sender";
import { Result, error, success } from "../common";
import ProjectRegistryABI from "../abis/allo-v1/ProjectRegistry";
import { IpfsUploader } from "../ipfs";
import { WaitUntilIndexerSynced } from "../indexer";

export class AlloV1 implements Allo {
  private projectRegistryAddress: Address;
  private transactionSender: TransactionSender;
  private ipfsUploader: IpfsUploader;
  private waitUntilIndexerSynced: WaitUntilIndexerSynced;
  private chainId: number;

  constructor(args: {
    chainId: number;
    transactionSender: TransactionSender;
    projectRegistryAddress: Address;
    ipfsUploader: IpfsUploader;
    waitUntilIndexerSynced: WaitUntilIndexerSynced;
  }) {
    this.chainId = args.chainId;
    this.transactionSender = args.transactionSender;
    this.projectRegistryAddress = args.projectRegistryAddress;
    this.ipfsUploader = args.ipfsUploader;
    this.waitUntilIndexerSynced = args.waitUntilIndexerSynced;
  }

  createProject(args: {
    name: string;
    metadata: Record<string, unknown>;
  }): AlloOperation<
    Result<{ projectId: bigint }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  > {
    return new AlloOperation(async ({ emit }) => {
      // --- upload metadata to IPFS
      const ipfsResult = await this.ipfsUploader(args.metadata);

      emit("ipfs", ipfsResult);

      if (ipfsResult.type === "error") {
        return ipfsResult;
      }

      // --- send transaction to create project
      const txResult = await sendTransaction(this.transactionSender, {
        address: this.projectRegistryAddress,
        abi: ProjectRegistryABI,
        functionName: "createProject",
        args: [{ protocol: 1n, pointer: ipfsResult.value }],
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      // --- wait for transaction to be mined
      let blockNumber: bigint;

      try {
        const receipt = await this.transactionSender.wait(txResult.value);

        emit("transactionStatus", success(receipt));
        blockNumber = receipt.blockNumber;
      } catch (err) {
        const result = new AlloError("Failed to create project");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber,
      });

      // TODO: get project id from receipt logs
      return success({ projectId: 0n });
    });
  }
}
