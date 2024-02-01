import { Hex } from "viem";
import { AnyJson } from "..";
import { Result } from "./common";
import { AlloOperation } from "./operation";
import { TransactionReceipt } from "./transaction-sender";

/**
 * Represents the common interface for interacting with Allo contracts.
 *
 * @remarks
 *
 * This interface provides methods to perform various operations related to Allo contracts.
 * Each operation returns an `AlloOperation` which is an event emitter that reports the progress
 * of the operation and resolves to a final result.
 *
 * @public
 *
 * @example
 *
 * ```typescript
 * const result = await allo.createProject({ name: "Project", metadata: {} });
 * ```
 */
export interface Allo {
  /**
   * Creates a new project
   *
   * @param args { name: string; metadata: AnyJson }
   * @returns AllotOperation<Result<{ projectId: Hex }>, { ipfs: Result<string>; transaction: Result<Hex>; transactionStatus: Result<TransactionReceipt> }>
   */
  createProject: (args: { name: string; metadata: AnyJson }) => AlloOperation<
    Result<{ projectId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  >;

  /**
   * Updates the metadata of a project
   *
   * @param args { projectId: Hex; metadata: AnyJson }
   * @returns AllotOperation<Result<{ projectId: Hex }>, { ipfs: Result<string>; transaction: Result<Hex>; transactionStatus: Result<TransactionReceipt> }>
   */
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

  /**
   * Applies to a round
   *
   * @param args { projectId: Hex; roundId: Hex; metadata: AnyJson }
   * @returns AllotOperation<Result<Hex>, { ipfs: Result<string>; transaction: Result<Hex>; transactionStatus: Result<TransactionReceipt> }>
   */
  applyToRoundV1?: (args: {
    projectId: Hex;
    strategy?: Hex;
    roundId: Hex;
    metadata: AnyJson;
  }) => AlloOperation<
    Result<Hex>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  >;

  /**
   * Applies to a round
   *
   * @param args { projectId: Hex; roundId: Hex; metadata: AnyJson }
   * @returns AllotOperation<Result<Hex>, { ipfs: Result<string>; transaction: Result<Hex>; transactionStatus: Result<TransactionReceipt> }>
   */
  applyToRoundV2?: (args: {
    projectId: Hex;
    strategy: Hex;
    roundId?: Hex;
    metadata: AnyJson;
  }) => AlloOperation<
    Result<Hex>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  >;
}

export { AlloOperation };

/**
 * Represents an error that occurred while interacting with Allo.
 *
 * @remarks
 *
 * This error is thrown when an error occurs while interacting with Allo contracts.
 *
 * @public
 *
 * @extends Error
 *
 * @example
 *
 * ```typescript
 * try {
 *  const result = await allo.createProject({ name: "Project", metadata: {} });
 * } catch (error) {
 *   if (error instanceof AlloError) {
 *     console.error("An error occurred while creating the project", error);
 *   }
 * }
 * ```
 */
export class AlloError extends Error {
  constructor(
    message: string,
    public inner: unknown = undefined
  ) {
    super(message);

    this.name = "AlloError";
  }
}
