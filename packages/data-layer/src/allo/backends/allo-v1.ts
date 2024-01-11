import { Address, Hex } from "viem";
import { Allo, AlloError, AlloOperation } from "../index";
import {
  TransactionReceipt,
  TransactionSender,
  sendTransaction,
} from "../transaction-sender";
import { Result, error, success, uploadToIPFS } from "../common";
import ProjectRegistryABI from "../abis/allo-v1/ProjectRegistry";

export class AlloV1 implements Allo {
  private projectRegistryAddress: Address;
  private transactionSender: TransactionSender;

  constructor(args: {
    transactionSender: TransactionSender;
    projectRegistryAddress: Address;
  }) {
    this.transactionSender = args.transactionSender;
    this.projectRegistryAddress = args.projectRegistryAddress;
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
      const ipfsResult = await uploadToIPFS(args.metadata);

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
      let blockNumber;

      try {
        const receipt = await this.transactionSender.wait(txResult.value);

        emit("transactionStatus", success(receipt));
        blockNumber = receipt.blockNumber;
      } catch (err) {
        const result = new AlloError("Failed to create project");
        emit("transactionStatus", error(result));
        return error(result);
      }

      console.log(blockNumber);

      // -- TODO: poll indexer until blockNumber is indexed

      return success({ projectId: 0n });
    });
  }
}
