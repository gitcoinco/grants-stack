import {
  RoundsActions,
  ROUNDS_LOADING_ROUND,
  ROUNDS_ROUND_LOADED,
  ROUNDS_UNLOADED,
  ROUNDS_LOADING_ERROR,
} from "../actions/rounds";
import { Round } from "../types";

export const enum Status {
  Empty = 0,
  LoadingApplicationsStartTime,
  LoadingApplicationsEndTime,
  LoadingRoundStartTime,
  LoadingRoundEndTime,
  LoadingToken,
  LoadingRoundMetaPtr,
  LoadingRoundMetadata,
  LoadingApplicationMetaPtr,
  LoadingApplicationMetadata,
  Loaded,
  Error,
}

export interface RoundsState {
  [address: string]: {
    status: Status;
    error: string | undefined;
    round: Round | undefined;
  };
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
    case ROUNDS_LOADING_ROUND: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: action.status,
        },
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
        },
      };
    }

    case ROUNDS_LOADING_ERROR: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: Status.Error,
          error: action.error,
        },
      };
    }

    case ROUNDS_UNLOADED: {
      return initialState;
    }

    default:
      return state;
  }
};
