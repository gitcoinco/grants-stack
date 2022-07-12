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

export const ROUNDS_UNLOAD = "ROUNDS_UNLOAD";
interface RoundsUnloadAction {
  type: typeof ROUNDS_UNLOAD;
}

export type RoundsActions =
  RoundsLoadingMetaPtrAction |
  RoundsRoundLoadedAction |
  RoundsUnloadAction;
