import { Dispatch } from "redux";
// import { RootState } from "../reducers";
import { Round } from "../types";

export const ROUNDS_LOADING_META_PTR = "ROUNDS_LOADING_META_PTR";
interface RoundsLoadingMetaPtrAction {
  type: typeof ROUNDS_LOADING_META_PTR;
  address: string;
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

export type RoundsActions =
  | RoundsLoadingMetaPtrAction
  | RoundsRoundLoadedAction
  | RoundsUnloadedAction;

const loadingMetaPtr = (address: string): RoundsActions => ({
  type: ROUNDS_LOADING_META_PTR,
  address,
});

const roundLoaded = (address: string, round: Round): RoundsActions => ({
  type: ROUNDS_ROUND_LOADED,
  address,
  round,
});

const roundsUnloaded = (): RoundsActions => ({
  type: ROUNDS_UNLOADED,
});

export const unloadRounds = () => roundsUnloaded();

export const loadRound = (address: string) => async (dispatch: Dispatch) => {
  dispatch(loadingMetaPtr(address));
  setTimeout(() => {
    const testRound = {
      address,
      name: "Test Round",
      metaPtr: {
        protocol: "1",
        pointer: "test/pointer",
      },
      metadata: "test metadata",
    };
    dispatch(roundLoaded(address, testRound));
  }, 1000);
};
