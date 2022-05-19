import {
  GrantMetadataActions,
  GRANT_METADATA_FETCHED,
  GRANT_METADATA_LOADING,
} from "../actions/grantsMetadata";
import { Metadata } from "../types";

export interface GrantsMetadataState {
  [id: number]: {
    loading: boolean;
    metadata: Metadata | undefined;
  };
}

export const initialState: GrantsMetadataState = {};

export const grantsMetadataReducer = (
  state: GrantsMetadataState = initialState,
  action: GrantMetadataActions
): GrantsMetadataState => {
  switch (action.type) {
    case GRANT_METADATA_FETCHED: {
      return {
        ...state,
        [action.data.id]: {
          loading: false,
          metadata: action.data,
        },
      };
    }

    case GRANT_METADATA_LOADING: {
      return {
        ...state,
        [action.id]: {
          loading: true,
          metadata: undefined,
        },
      };
    }

    default: {
      return state;
    }
  }
};
