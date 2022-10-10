import {
  RoundsActions,
  ROUNDS_LOADING_ERROR,
  ROUNDS_LOADING_ROUND,
  ROUNDS_ROUND_LOADED,
  ROUNDS_UNLOADED,
  ROUND_PROJECTS_LOADED,
  ROUND_PROJECTS_LOADING,
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

    case ROUND_PROJECTS_LOADING: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: Status.LoadingRoundProjects,
          error: undefined,
        },
      };
    }

    case ROUND_PROJECTS_LOADED: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: Status.LoadedRoundProjects,
          error: undefined,
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
