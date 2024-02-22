import {
  RoundsActions,
  ROUNDS_LOADING_ERROR,
  ROUNDS_LOADING_ROUND,
  ROUNDS_ROUND_LOADED,
  ROUNDS_UNLOADED,
} from "../actions/rounds";
import { Round } from "../types";

export const enum Status {
  Undefined = 0,
  LoadingApplicationsStartTime,
  LoadingApplicationsEndTime,
  LoadingRoundStartTime,
  LoadingRoundEndTime,
  LoadingToken,
  LoadingRoundMetaPtr,
  LoadingRoundMetadata,
  LoadingApplicationMetaPtr,
  LoadingApplicationMetadata,
  LoadingProgramMetaPtr,
  LoadingProgramMetadata,
  LoadingRoundPayoutStrategy,
  Loaded,
  LoadingRoundProjects,
  LoadedRoundProjects,
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
  status: Status.Undefined,
  error: undefined,
  round: undefined,
};

export const roundsReducer = (
  state: RoundsState = initialState,
  action: RoundsActions
): RoundsState => {
  switch (action.type) {
    case ROUNDS_LOADING_ROUND: {
      const round = state[action.id] || roundInitialState;
      return {
        ...state,
        [action.id]: {
          ...round,
          status: action.status,
        },
      };
    }

    case ROUNDS_ROUND_LOADED: {
      const round = state[action.id] || roundInitialState;
      return {
        ...state,
        [action.id]: {
          ...round,
          status: Status.Loaded,
          error: undefined,
          round: action.round,
        },
      };
    }

    case ROUNDS_LOADING_ERROR: {
      const round = state[action.id] || roundInitialState;
      return {
        ...state,
        [action.id]: {
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
