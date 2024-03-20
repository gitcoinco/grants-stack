import { getConfig } from "common/src/config";
import { DataLayer, RoundCategory } from "data-layer";
import { Dispatch } from "redux";
import { Status } from "../reducers/rounds";
import { Round } from "../types";
import { parseRoundApplicationMetadata } from "../utils/roundApplication";

export const ROUNDS_LOADING_ROUND = "ROUNDS_LOADING_ROUND";
interface RoundsLoadingRoundAction {
  type: typeof ROUNDS_LOADING_ROUND;
  id: string;
  status: Status;
}

export const ROUNDS_ROUND_LOADED = "ROUNDS_ROUND_LOADED";
interface RoundsRoundLoadedAction {
  type: typeof ROUNDS_ROUND_LOADED;
  id: string;
  round: Round;
}

export const ROUNDS_UNLOADED = "ROUNDS_UNLOADED";
interface RoundsUnloadedAction {
  type: typeof ROUNDS_UNLOADED;
}

export const ROUNDS_LOADING_ERROR = "ROUNDS_LOADING_ERROR";
interface RoundsLoadingErrorAction {
  type: typeof ROUNDS_LOADING_ERROR;
  id: string;
  error: string;
}

export type RoundsActions =
  | RoundsLoadingRoundAction
  | RoundsRoundLoadedAction
  | RoundsUnloadedAction
  | RoundsLoadingErrorAction;

export const roundLoaded = (id: string, round: Round): RoundsActions => ({
  type: ROUNDS_ROUND_LOADED,
  id,
  round,
});

const roundsUnloaded = (): RoundsActions => ({
  type: ROUNDS_UNLOADED,
});

const loadingError = (id: string, error: string): RoundsActions => ({
  type: ROUNDS_LOADING_ERROR,
  id,
  error,
});

export const unloadRounds = () => roundsUnloaded();

export const loadRound =
  (roundId: string, dataLayer: DataLayer, chainId: number) =>
  async (dispatch: Dispatch) => {
    const { version } = getConfig().allo;

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

    let roundPayoutStrategy: RoundCategory;

    let applicationsStartTime;
    let applicationsEndTime;
    let roundStartTime;
    let roundEndTime;
    switch (v2Round.strategyName) {
      case "allov1.Direct":
      case "allov2.DirectGrantsSimpleStrategy":
        // application times == round times
        roundPayoutStrategy = RoundCategory.Direct;
        applicationsStartTime =
          Date.parse(v2Round.applicationsStartTime) / 1000;
        applicationsEndTime = Date.parse(v2Round.applicationsEndTime) / 1000;
        roundStartTime = Date.parse(v2Round.applicationsStartTime) / 1000;
        roundEndTime = Date.parse(v2Round.applicationsEndTime) / 1000;
        break;

      case "allov1.QF":
      case "allov2.DonationVotingMerkleDistributionDirectTransferStrategy":
      default:
        roundPayoutStrategy = RoundCategory.QuadraticFunding;
        applicationsStartTime =
          Date.parse(v2Round.applicationsStartTime) / 1000;
        applicationsEndTime = Date.parse(v2Round.applicationsEndTime) / 1000;
        roundStartTime = Date.parse(v2Round.donationsStartTime) / 1000;
        roundEndTime = Date.parse(v2Round.donationsEndTime) / 1000;
    }

    const round = {
      id: version === "allo-v1" ? roundId : v2Round.id,
      address: version === "allo-v1" ? roundId : v2Round.strategyAddress,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
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
      programName: v2Round.project.name || v2Round.project.metadata.name || "",
      payoutStrategy: roundPayoutStrategy,
      tags: v2Round.tags,
    };

    dispatch(roundLoaded(roundId, round));
  };
