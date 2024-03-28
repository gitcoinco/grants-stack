import { Signer } from "@ethersproject/abstract-signer";
import { ApplicationStatus, DistributionMatch, Round } from "data-layer";
import { Address, Hex, PublicClient } from "viem";
import { AnyJson, ChainId } from "..";
import {
  CreateRoundData,
  RoundCategory,
  UpdateRoundParams,
  MatchingStatsData,
  VotingToken,
} from "../types";
import { Result } from "./common";
import { AlloOperation } from "./operation";
import { TransactionReceipt } from "./transaction-sender";
import { PermitSignature } from "./voting";

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
  createProject: (args: {
    name: string;
    metadata: AnyJson;
    nonce?: bigint;
    memberAddresses: Address[];
  }) => AlloOperation<
    Result<{ projectId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  >;

  createProgram: (args: {
    name: string;
    memberAddresses: Address[];
  }) => AlloOperation<
    Result<{ programId: Hex }>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
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
      indexingStatus: Result<void>;
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
    roundId: Hex | number;
    metadata: AnyJson;
    strategy?: RoundCategory;
  }) => AlloOperation<
    Result<Hex>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
    }
  >;

  donate: (
    publicClient: PublicClient,
    chainId: ChainId,
    token: VotingToken,
    groupedVotes: Record<string, Hex[]>,
    groupedAmounts: Record<string, bigint> | bigint[],
    nativeTokenAmount: bigint,
    permit?: {
      sig: PermitSignature;
      deadline: number;
      nonce: bigint;
    }
  ) => Promise<TransactionReceipt>;

  bulkUpdateApplicationStatus: (args: {
    roundId: string;
    strategyAddress: Address;
    applicationsToUpdate: {
      index: number;
      status: ApplicationStatus;
    }[];
    currentApplications: {
      index: number;
      status: ApplicationStatus;
    }[];
  }) => AlloOperation<
    Result<void>,
    {
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  >;

  fundRound: (args: {
    tokenAddress: Address;
    roundId: string;
    amount: bigint;
  }) => AlloOperation<
    Result<null>,
    {
      tokenApprovalStatus: Result<TransactionReceipt | null>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
    }
  >;

  withdrawFundsFromStrategy: (args: {
    payoutStrategyAddress: Address;
    tokenAddress: Address;
    recipientAddress: Address;
  }) => AlloOperation<
    Result<null>,
    {
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
    }
  >;

  finalizeRound: (args: {
    roundId: string;
    strategyAddress: Address;
    matchingDistribution: DistributionMatch[];
  }) => AlloOperation<
    Result<null>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
    }
  >;

  editRound: (args: {
    roundId: Hex | number;
    roundAddress?: Hex;
    data: UpdateRoundParams;
    strategy?: RoundCategory;
  }) => AlloOperation<
    Result<Hex | number>,
    {
      ipfs: Result<string>;
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<void>;
    }
  >;

  batchDistributeFunds: (args: {
    payoutStrategy: Address;
    allProjects: MatchingStatsData[];
    projectIdsToBePaid: string[];
  }) => AlloOperation<
    Result<null>,
    {
      transaction: Result<Hex>;
      transactionStatus: Result<TransactionReceipt>;
      indexingStatus: Result<null>;
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
