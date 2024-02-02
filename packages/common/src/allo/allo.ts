import { Hex } from "viem";
import { AnyJson } from "..";
import { Result } from "./common";
import { AlloOperation } from "./operation";
import { TransactionReceipt } from "./transaction-sender";

/**
 * Represents the common interface for interacting with Allo contracts.
 * This interface provides methods to perform various operations related to Allo contracts.
 * Each operation returns an `AlloOperation` which is an event emitter that reports the progress
 * of the operation and resolves to a final result.
 */
export interface Allo {
  createProject: (args: { name: string; metadata: AnyJson }) => AlloOperation<
    Result<{ projectId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  >;

  updateProjectMetadata: (args: {
    projectId: Hex;
    metadata: AnyJson;
  }) => AlloOperation<
    Result<{ projectId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  >;
}

export { AlloOperation };

export class AlloError extends Error {
  constructor(
    message: string,
    public inner: unknown = undefined
  ) {
    super(message);

    this.name = "AlloError";
  }
}
