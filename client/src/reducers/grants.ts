import {
  GrantsActions,
  GRANTS_LOADING,
  GRANTS_LOADED,
  GRANTS_UNLOADED
} from "../actions/grants";
import { Grant } from "../types";

export interface GrantsListItem {
  uri: string
  grant: Grant | undefined
}

export interface GrantsState {
  loading: boolean
  grants: GrantsListItem[]
}

const initialState = {
  loading: false,
  grants: []
};

export const grantsReducer = (state: GrantsState = initialState, action: GrantsActions): GrantsState => {
  switch (action.type) {
    case GRANTS_LOADING: {
      return {
        ...state,
        loading: true,
        grants: []
      }
    }

    case GRANTS_LOADED: {
      const grants = new Array<GrantsListItem>();
      action.grantsURIs.forEach((uri: string) => {
        const matches = uri.match(/^https:\/\/ipfs.io\/ipfs\/(.+)$/);
        if (matches && matches.length === 2) {
          grants.push({
            uri: matches[1],
            grant: undefined
          });
        }
      });

      return {
        ...state,
        loading: false,
        grants,
      }
    }

    case GRANTS_UNLOADED: {
      return {
        ...state,
        loading: false,
        grants: [],
      }
    }
  }

  return state;
};
