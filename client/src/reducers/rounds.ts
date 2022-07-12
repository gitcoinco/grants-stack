import {
  RoundsActions,
  ROUNDS_LOADING_ROUND_META_PTR,
  ROUNDS_LOADING_ROUND_METADATA,
  ROUNDS_LOADING_APPLICATION_META_PTR,
  ROUNDS_LOADING_APPLICATION_METADATA,
  ROUNDS_ROUND_LOADED,
  ROUNDS_UNLOADED,
  ROUNDS_LOADING_ERROR,
} from "../actions/rounds";
import { Round } from "../types";

export const enum Status {
  Empty = 0,
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
    case ROUNDS_LOADING_ROUND_META_PTR: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: Status.LoadingRoundMetaPtr,
        },
      };
    }

    case ROUNDS_LOADING_ROUND_METADATA: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: Status.LoadingRoundMetadata,
        },
      };
    }

    case ROUNDS_LOADING_APPLICATION_META_PTR: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: Status.LoadingApplicationMetaPtr,
        },
      };
    }

    case ROUNDS_LOADING_APPLICATION_METADATA: {
      const round = state[action.address] || roundInitialState;
      return {
        ...state,
        [action.address]: {
          ...round,
          status: Status.LoadingApplicationMetadata,
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
