import {
  RoundsActions,
  ROUNDS_LOADING_META_PTR,
  ROUNDS_ROUND_LOADED,
  ROUNDS_UNLOAD,
} from "../actions/rounds";
import { Round } from "../types";

export const enum Status {
  Empty = 0,
  LoadingMetaPtr,
  LoadingMetadata,
  Loaded,
  Error,
}

export interface RoundsState {
  [address: string]: {
    status: Status;
    error: string | undefined;
    round: Round | undefined;
  }
}

const initialState: RoundsState = {};

const roundInitialState = {
  status: Status.Empty,
  error: undefined,
  round: undefined,
};

export const roundsReducer = (
  state: RoundsState = initialState,
  action: RoundsActions
): RoundsState => {
  switch (action.type) {
    case ROUNDS_LOADING_META_PTR: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: Status.LoadingMetaPtr,
        }
      };
    }

    case ROUNDS_ROUND_LOADED: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: Status.Loaded,
          error: undefined,
          round: action.round,
        }
      };
    }

    case ROUNDS_UNLOAD: {
      return initialState;
    }

    default:
      return state;
  }
}
