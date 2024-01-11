import { Hex } from "viem";
import { AlloOperation } from "./operation";
import { Result } from "./common";
import { TransactionReceipt } from "./transaction-sender";

export { AlloOperation };

/**
 * Represents the common interface for interacting with Allo contracts.
 * This interface provides methods to perform various operations related to Allo contracts.
 * Each operation returns an `AlloOperation` which is an event emitter that reports the progress
 * of the operation and resolves to a final result.
 *
 * @example
 * ```typescript
 * const allo = new AlloV1({});
 *
 * const result = await allo
 *   .createProject({
 *     name: "My Project",
 *     metadata: {
 *       description: "My project description",
 *     },
 *   })
 *   .on("ipfs", (result) => {
 *     if (result.type === "success") {
 *       console.log("IPFS CID", result.value);
 *     } else {
 *       console.log("IPFS Error", result.error);
 *     }
 *   })
 *   .on("transaction", (result) => {
 *     if (result.type === "success") {
 *       console.log("Transaction", result.value);
 *     } else {
 *       console.log("Transaction Error", result.error);
 *     }
 *   })
 *   .on("transactionStatus", (result) => {
 *     if (result.type === "success") {
 *       console.log("Transaction Status", result.value);
 *     } else {
 *       console.log("Transaction Status Error", result.error);
 *     }
 *   })
 *   .execute();
 *
 * if (result.type === "success") {
 *   console.log("Project ID", result.value.projectId);
 * } else {
 *   // the whole operation failed
 *   console.log("Project ID Error", result.error);
 * }
 * ```
 */
export interface Allo {
  createProject: (args: {
    name: string;
    metadata: Record<string, unknown>;
  }) => AlloOperation<
    Result<{ projectId: bigint }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
    }
  >;
}
