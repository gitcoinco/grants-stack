import {
  GrantMetadataActions,
  GRANT_METADATA_LOADING_URI,
  GRANT_METADATA_LOADING,
  GRANT_METADATA_FETCHED,
  GRANT_METADATA_FETCHING_ERROR,
} from "../actions/grantsMetadata";
import { Metadata } from "../types";
import { Status } from "./newGrant";

export interface GrantsMetadataState {
  [id: number]: {
    loading: boolean;
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
          loading: true,
        },
      };
    }

    case GRANT_METADATA_LOADING: {
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          loading: true,
          metadata: undefined,
        },
      };
    }

    case GRANT_METADATA_FETCHED: {
      return {
        ...state,
        [action.data.id]: {
          ...state[action.data.id],
          loading: false,
          metadata: action.data,
        },
      };
    }

    case GRANT_METADATA_FETCHING_ERROR: {
      return {
        ...state,
        [action.id]: {
          loading: false,
          metadata: undefined,
          status: Status.Error,
          error: action.error,
        },
      };
    }

    default: {
      return state;
    }
  }
};
