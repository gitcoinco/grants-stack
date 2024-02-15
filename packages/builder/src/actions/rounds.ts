import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { getConfig } from "common/src/config";
import { DataLayer } from "data-layer";
import { ethers } from "ethers";
import { Dispatch } from "redux";
import { Status } from "../reducers/rounds";
import { Round } from "../types";
import { parseRoundApplicationMetadata } from "../utils/roundApplication";

export type RoundType = "MERKLE" | "DIRECT";

export const ROUNDS_LOADING_ROUND = "ROUNDS_LOADING_ROUND";
interface RoundsLoadingRoundAction {
  type: typeof ROUNDS_LOADING_ROUND;
  address: string;
  status: Status;
}

export const ROUNDS_ROUND_LOADED = "ROUNDS_ROUND_LOADED";
interface RoundsRoundLoadedAction {
  type: typeof ROUNDS_ROUND_LOADED;
  address: string;
  round: Round;
}

export const ROUNDS_UNLOADED = "ROUNDS_UNLOADED";
interface RoundsUnloadedAction {
  type: typeof ROUNDS_UNLOADED;
}

export const ROUNDS_LOADING_ERROR = "ROUNDS_LOADING_ERROR";
interface RoundsLoadingErrorAction {
  type: typeof ROUNDS_LOADING_ERROR;
  address: string;
  error: string;
}

export type RoundsActions =
  | RoundsLoadingRoundAction
  | RoundsRoundLoadedAction
  | RoundsUnloadedAction
  | RoundsLoadingErrorAction;

export const roundLoaded = (address: string, round: Round): RoundsActions => ({
  type: ROUNDS_ROUND_LOADED,
  address,
  round,
});

const roundsUnloaded = (): RoundsActions => ({
  type: ROUNDS_UNLOADED,
});

const loadingError = (address: string, error: string): RoundsActions => ({
  type: ROUNDS_LOADING_ERROR,
  address,
  error,
});

export const unloadRounds = () => roundsUnloaded();

export const loadRound =
  (roundId: string, dataLayer: DataLayer, chainId: number) =>
  async (dispatch: Dispatch) => {
    const { version } = getConfig().allo;

    try {
      // address validation
      if (version === "allo-v1") {
        ethers.utils.getAddress(roundId);
      } else if (roundId.includes("0x")) {
        throw new Error(`Invalid roundId ${roundId}`);
      }
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.warn(`invalid address or address checksum ${roundId}`);
      dispatch(loadingError(roundId, "invalid address or address checksum"));
      console.error(e);
      return;
    }

    const v2Round = await dataLayer.getRoundByIdAndChainId({
      roundId,
      chainId,
    });

    if (!v2Round || !v2Round.roundMetadata || !v2Round.applicationMetadata) {
      dispatch(loadingError(roundId, "round not found"));
      return;
    }

    const applicationMetadata = parseRoundApplicationMetadata(
      v2Round.applicationMetadata
    );

    const programName =
      (await dataLayer.getProgramName({
        projectId: v2Round.roundMetadata.programContractAddress,
      })) || "";

    let roundPayoutStrategy: RoundType;

    switch (v2Round.strategyName) {
      case "allov1.QF":
      case "allov2.DonationVotingMerkleDistributionDirectTransferStrategy":
        roundPayoutStrategy = "MERKLE";
        break;
      case "allov1.Direct":
      case "allov2.DirectGrantsSimpleStrategy":
        roundPayoutStrategy = "DIRECT";
        break;
      default:
        roundPayoutStrategy = "MERKLE";
    }

    const round = {
      id: version === "allo-v1" ? roundId : v2Round.id,
      address: version === "allo-v1" ? roundId : v2Round.strategyAddress,
      applicationsStartTime:
        Date.parse(`${v2Round.applicationsStartTime}Z`) / 1000,
      applicationsEndTime: Date.parse(`${v2Round.applicationsEndTime}Z`) / 1000,
      roundStartTime: Date.parse(`${v2Round.donationsStartTime}Z`) / 1000,
      roundEndTime: Date.parse(`${v2Round.donationsEndTime}Z`) / 1000,
      token: v2Round.matchTokenAddress,
      roundMetaPtr: {
        protocol: "1",
        pointer: v2Round.roundMetadataCid,
      },
      roundMetadata: v2Round.roundMetadata,
      applicationMetaPtr: {
        protocol: "1",
        pointer: v2Round.applicationMetadataCid,
      },
      applicationMetadata,
      programName,
      payoutStrategy: roundPayoutStrategy,
    };

    dispatch(roundLoaded(roundId, round));
  };
