import {
  GrantMetadataActions,
  GRANT_METADATA_ALL_UNLOADED,
  GRANT_METADATA_FETCHED,
  GRANT_METADATA_FETCHING_ERROR,
  GRANT_METADATA_LOADING,
  GRANT_METADATA_LOADING_URI,
} from "../actions/grantsMetadata";
import { Metadata } from "../types";

export const enum Status {
  Undefined = 0,
  Loading,
  Loaded,
  Error,
}

export interface GrantsMetadataState {
  [id: string]: {
    metadata: Metadata | undefined;
    status: Status;
    error: string | undefined;
  };
}

export const initialState: GrantsMetadataState = {};

export const grantsMetadataReducer = (
  state: GrantsMetadataState = initialState,
  action: GrantMetadataActions
): GrantsMetadataState => {
  switch (action.type) {
    case GRANT_METADATA_LOADING_URI: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          status: Status.Loading,
        },
      };
    }

    case GRANT_METADATA_LOADING: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          status: Status.Loading,
          metadata: undefined,
        },
      };
    }

    case GRANT_METADATA_FETCHED: {
      return {
        ...state,
        [action.data.id]: {
          ...state[action.data.id],
          status: Status.Loaded,
          metadata: action.data,
        },
      };
    }

    case GRANT_METADATA_FETCHING_ERROR: {
      return {
        ...state,
        [action.id]: {
          metadata: undefined,
          status: Status.Error,
          error: action.error,
        },
      };
    }

    case GRANT_METADATA_ALL_UNLOADED: {
      return initialState;
    }

    default: {
      return state;
    }
  }
};
