/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signer } from "@ethersproject/abstract-signer";
import { TransactionResponse, Web3Provider } from "@ethersproject/providers";
import { BigNumber, ethers } from "ethers";
import {
  merklePayoutStrategyImplementationContract,
  roundImplementationContract,
} from "./contracts";
import { MatchingStatsData, Round } from "./types";
import { fetchFromIPFS } from "./utils";
import { maxDateForUint256 } from "../../constants";
import { DataLayer, V2RoundWithRoles } from "data-layer";

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

    const round = await dataLayer.getRoundByIdAndChainId({ roundId, chainId });

    return indexerV2RoundToRound(round);
  } catch (error) {
    console.error("getRoundById", error);
    throw "Unable to fetch round";
  }
}

function indexerV2RoundToRound(round: V2RoundWithRoles): Round {
  const operatorWallets = round.roles.map(
    (account: { address: string }) => account.address
  );

  return {
    id: round.id,
    chainId: round.chainId,
    roundMetadata: round.roundMetadata as Round["roundMetadata"],
    applicationMetadata:
      round.applicationMetadata as unknown as Round["applicationMetadata"],
    applicationsStartTime: new Date(round.applicationsStartTime),
    applicationsEndTime:
      round.applicationsEndTime === null
        ? maxDateForUint256
        : new Date(round.applicationsEndTime),
    roundStartTime: new Date(round.donationsStartTime),
    roundEndTime:
      round.donationsEndTime === null
        ? maxDateForUint256
        : new Date(round.donationsEndTime),
    token: round.matchTokenAddress,
    votingStrategy: "unknown",
    payoutStrategy: {
      id: round.strategyAddress,
      isReadyForPayout: round.isReadyForPayout,
      strategyName:
        round.strategyName === "allov1.Direct" ? "DIRECT" : "MERKLE",
    },
    ownedBy: round.projectId,
    operatorWallets: operatorWallets,
    finalized: false,
    createdByAddress: round.createdByAddress,
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

  let rounds = await dataLayer
    .getRoundsByProgramIdAndChainId({
      chainId: chainId,
      programId,
    })
    .then((rounds) => rounds.map(indexerV2RoundToRound));

  // Filter out rounds where operatorWallets does not include round.createdByAddress
  // This is to filter out spam rounds created by bots
  rounds = rounds.filter((round) => {
    return (
      round.createdByAddress &&
      round.operatorWallets?.includes(round.createdByAddress)
    );
  });

  return { rounds };
}

/**
 * Fetch finalized matching distribution
 * @param roundId - the ID of a specific round for detail
 * @param signerOrProvider
 */
export async function fetchMatchingDistribution(
  roundId: string | undefined,
  signerOrProvider: Web3Provider
): Promise<{
  distributionMetaPtr: string;
  matchingDistribution: MatchingStatsData[];
}> {
  try {
    if (!roundId) {
      throw new Error("Round ID is required");
    }
    let matchingDistribution: MatchingStatsData[] = [];
    const roundImplementation = new ethers.Contract(
      roundId,
      roundImplementationContract.abi,
      signerOrProvider
    );
    const payoutStrategyAddress = await roundImplementation.payoutStrategy();
    const payoutStrategy = new ethers.Contract(
      payoutStrategyAddress,
      merklePayoutStrategyImplementationContract.abi,
      signerOrProvider
    );
    const distributionMetaPtrRes = await payoutStrategy.distributionMetaPtr();
    const distributionMetaPtr = distributionMetaPtrRes.pointer;

    if (distributionMetaPtr !== "") {
      // fetch distribution from IPFS
      const matchingDistributionRes = await fetchFromIPFS(distributionMetaPtr);
      matchingDistribution = matchingDistributionRes.matchingDistribution;

      // parse matchAmountInToken to a valid BigNumber
      matchingDistribution.map((distribution) => {
        distribution.matchAmountInToken = BigNumber.from(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (distribution.matchAmountInToken as any).hex
        );
      });
    }

    return { distributionMetaPtr, matchingDistribution };
  } catch (error) {
    console.error("fetchMatchingDistribution", error);
    throw new Error("Unable to fetch matching distribution");
  }
}

/**
 * Pay Protocol & Round Fees and transfer funds to payout contract (only by ROUND_OPERATOR_ROLE)
 * @param roundId
 * @param signerOrProvider
 * @returns
 */
export const setReadyForPayout = async ({
  roundId,
  signerOrProvider,
}: {
  roundId: string;
  signerOrProvider: Signer;
}): Promise<TransactionResponse> => {
  const roundImplementation = new ethers.Contract(
    roundId,
    roundImplementationContract.abi,
    signerOrProvider
  );

  const tx = await roundImplementation.setReadyForPayout();
  return tx.wait();
};
