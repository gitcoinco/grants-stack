import { Address, Hex } from "viem";
import { AnyJson } from "..";
import { Result } from "./common";
import { AlloOperation } from "./operation";
import { TransactionReceipt } from "./transaction-sender";
import { CreateRoundData, RoundCategory } from "../types";
import { Round } from "data-layer";
import { Signer } from "@ethersproject/abstract-signer";

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
