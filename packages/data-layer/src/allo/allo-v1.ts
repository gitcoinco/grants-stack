import { Allo } from "../allo";
import { encodeFunctionData, Address } from "viem";

import ProjectRegistryABI from "../abis/allo-v1/ProjectRegistry";
import {
  TransactionExecutor,
  TransactionExecutorResult,
} from "../transaction-executor";

export class AlloV1 implements Allo {
  private projectRegistryAddress: Address;
  private transactionExecutor: TransactionExecutor;

  constructor(args: {
    transactionExecutor: TransactionExecutor;
    projectRegistryAddress: Address;
  }) {
    this.transactionExecutor = args.transactionExecutor;
    this.projectRegistryAddress = args.projectRegistryAddress;
  }

  async createProject(args: {
    metadataCid: string;
  }): Promise<TransactionExecutorResult> {
    const data = encodeFunctionData({
      abi: ProjectRegistryABI,
      functionName: "createProject",
      args: [{ protocol: 1n, pointer: args.metadataCid }],
    });

    return await this.transactionExecutor({
      to: this.projectRegistryAddress,
      data: data,
      value: 0n,
    });
  }

  async updateProjectMetadata(args: {
    projectId: bigint;
    newMetadataCid: string;
  }): Promise<TransactionExecutorResult> {
    const data = encodeFunctionData({
      abi: ProjectRegistryABI,
      functionName: "updateProjectMetadata",
      args: [args.projectId, { protocol: 1n, pointer: args.newMetadataCid }],
    });

    return await this.transactionExecutor({
      to: this.projectRegistryAddress,
      data: data,
      value: 0n,
    });
  }
}
