/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataLayer, RoundForManager } from "data-layer";
import { ethers } from "ethers";
import { maxDateForUint256 } from "../../constants";
import { roundImplementationContract } from "./contracts";
import { Round } from "./types";
import { Signer } from "@ethersproject/abstract-signer";
import { TransactionResponse } from "@ethersproject/providers";
import moment from "moment";

export enum UpdateAction {
  UPDATE_APPLICATION_META_PTR = "updateApplicationMetaPtr",
  UPDATE_ROUND_META_PTR = "updateRoundMetaPtr",
  UPDATE_ROUND_START_AND_END_TIMES = "updateStartAndEndTimes",
  UPDATE_MATCH_AMOUNT = "updateMatchAmount",
  UPDATE_ROUND_FEE_ADDRESS = "updateRoundFeeAddress",
  UPDATE_ROUND_FEE_PERCENTAGE = "updateRoundFeePercentage",
}

export class TransactionBuilder {
  round: Round;
  signer: Signer;
  transactions: any[];
  contract: any;

  constructor(round: Round, signer: Signer) {
    this.round = round;
    this.signer = signer;
    this.transactions = [];
    if (round.id) {
      this.contract = new ethers.Contract(
        round.id,
        roundImplementationContract.abi,
        signer
      );
    } else {
      throw new Error("Round ID is undefined");
    }
  }

  add(action: any, args: any[]) {
    this.transactions.push(
      this.contract.interface.encodeFunctionData(action, args)
    );
  }

  async execute(): Promise<TransactionResponse> {
    if (this.transactions.length === 0) {
      throw new Error("No transactions to execute");
    }
    return await this.contract.multicall(this.transactions);
  }

  getTransactions() {
    return this.transactions;
  }
}

/**
 * Fetch a round by ID
 * @param signerOrProvider - provider
 * @param roundId - the ID of a specific round for detail
 */
export async function getRoundById(args: {
  chainId: number;
  roundId: string;
  dataLayer: DataLayer;
}): Promise<Round> {
  try {
    const { chainId, roundId, dataLayer } = args;

    const round = await dataLayer.getRoundForManager({ roundId, chainId });

    if (round === null) {
      throw "Round not found";
    }

    return indexerV2RoundToRound(round);
  } catch (error) {
    console.error("getRoundById", error);
    throw "Unable to fetch round";
  }
}

function indexerV2RoundToRound(round: RoundForManager): Round {
  const operatorWallets = round.roles.map(
    (account: { address: string }) => account.address
  );

  const strategyName =
    round.strategyName === "allov1.Direct" ||
    round.strategyName === "allov2.DirectGrantsSimpleStrategy" ||
    round.strategyName === "allov2.DirectGrantsLiteStrategy"
      ? "DIRECT"
      : "MERKLE";

  const applicationsStartTime = round.applicationsStartTime;
  const applicationsEndTime = round.applicationsEndTime;

  // Direct grants strategy uses the application start and end time for donations
  const donationsStartTime =
    strategyName == "MERKLE" ? round.donationsStartTime : applicationsStartTime;
  const donationsEndTime =
    strategyName == "MERKLE" ? round.donationsEndTime : applicationsEndTime;

  return {
    id: round.id,
    strategyName: round.strategyName,
    chainId: round.chainId,
    roundMetadata: round.roundMetadata as Round["roundMetadata"],
    applicationMetadata:
      round.applicationMetadata as unknown as Round["applicationMetadata"],
    applicationsStartTime: new Date(applicationsStartTime),
    applicationsEndTime:
      applicationsEndTime === null || !moment(applicationsEndTime).isValid()
        ? maxDateForUint256
        : new Date(applicationsEndTime),
    roundStartTime: new Date(donationsStartTime),
    roundEndTime:
      donationsEndTime === null || !moment(applicationsEndTime).isValid()
        ? maxDateForUint256
        : new Date(donationsEndTime),
    token: round.matchTokenAddress,
    votingStrategy: "unknown",
    payoutStrategy: {
      id: round.strategyAddress,
      isReadyForPayout: round.readyForPayoutTransaction !== null,
      strategyName,
    },
    ownedBy: round.projectId,
    operatorWallets: operatorWallets,
    roles: round.roles,
    finalized: false,
    tags: round.tags,
    createdByAddress: round.createdByAddress,
    strategyAddress: round.strategyAddress,
    matchAmount: BigInt(round.matchAmount),
    matchAmountInUsd: round.matchAmountInUsd,
    fundedAmount: BigInt(round.fundedAmount),
    fundedAmountInUsd: round.fundedAmountInUsd,
    matchingDistribution: round.matchingDistribution,
    readyForPayoutTransaction: round.readyForPayoutTransaction,
  };
}

/**
 * Fetch a list of rounds
 */
export async function listRounds(args: {
  chainId: number;
  dataLayer: DataLayer;
  programId: string;
}): Promise<{ rounds: Round[] }> {
  const { chainId, dataLayer, programId } = args;

  const rounds = await dataLayer
    .getRoundsForManager({
      chainId: chainId,
      programId,
    })
    .then((rounds) => rounds.map(indexerV2RoundToRound));

  return { rounds };
}

export async function listRoundsByAddress(args: {
  chainIds: number[];
  dataLayer: DataLayer;
  address: string;
}): Promise<{ rounds: Round[] }> {
  const { chainIds, dataLayer, address } = args;

  const rounds = await dataLayer
    .getRoundsForManagersByAddress({
      chainIds,
      address,
    })
    .then((rounds) => rounds.map(indexerV2RoundToRound));

  return { rounds };
}