import { Signer } from "@ethersproject/abstract-signer";
import { Round } from "data-layer";
import { Address, Hex } from "viem";
import { AnyJson } from "..";
import { CreateRoundData, RoundCategory } from "../types";
import { Result } from "./common";
import { AlloOperation } from "./operation";
import { TransactionReceipt } from "./transaction-sender";

export type CreateRoundArguments = {
  roundData: {
    roundCategory: RoundCategory;
    roundMetadataWithProgramContractAddress: Round["roundMetadata"];
    applicationQuestions: CreateRoundData["applicationQuestions"];
    roundStartTime: Date;
    roundEndTime: Date;
    applicationsStartTime: Date;
    applicationsEndTime: Date;
    token: string;
    matchingFundsAvailable: number;
    roundOperators: Address[];
  };
  walletSigner: Signer;
};

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

  createRound: (args: CreateRoundArguments) => AlloOperation<
    Result<{ roundId: Hex }>,
    {
      ipfsStatus: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  >;

  /**
   * Applies to a round
   *
   * @param args { projectId: Hex; roundId: Hex|Number; metadata: AnyJson }
   * @dev roundId is round address in allo v1  
   * @dev roundId is poolId in allo v2
   * @returns AlloOperation<Result<Hex>, { ipfs: Result<string>; transaction: Result<Hex>; transactionStatus: Result<TransactionReceipt> }>
   */
  applyToRound: (args: {
    projectId: Hex;
    roundId: Hex|number;
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
