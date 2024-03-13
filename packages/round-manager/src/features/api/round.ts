/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signer } from "@ethersproject/abstract-signer";
import { TransactionResponse, Web3Provider } from "@ethersproject/providers";
import { DataLayer, RoundForManager, V2RoundWithRoles } from "data-layer";
import { BigNumber, ethers } from "ethers";
import { maxDateForUint256 } from "../../constants";
import {
  merklePayoutStrategyImplementationContract,
  roundImplementationContract,
} from "./contracts";
import { MatchingStatsData, Round } from "./types";
import { fetchFromIPFS } from "./utils";

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
    round.strategyName === "allov2.DirectGrantsSimpleStrategy"
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
    chainId: round.chainId,
    roundMetadata: round.roundMetadata as Round["roundMetadata"],
    applicationMetadata:
      round.applicationMetadata as unknown as Round["applicationMetadata"],
    applicationsStartTime: new Date(applicationsStartTime),
    applicationsEndTime:
      applicationsEndTime === null
        ? maxDateForUint256
        : new Date(applicationsEndTime),
    roundStartTime: new Date(donationsStartTime),
    roundEndTime:
      donationsEndTime === null
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
    finalized: false,
    tags: round.tags,
    createdByAddress: round.createdByAddress,
    strategyAddress: round.strategyAddress,
    matchAmount: BigInt(round.matchAmount),
    matchAmountInUsd: round.matchAmountInUsd,
    fundedAmount: BigInt(round.fundedAmount),
    fundedAmountInUsd: round.fundedAmountInUsd,
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
    .getRoundsForManager({
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
