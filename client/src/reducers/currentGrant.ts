import {
  CurrentGrantActions,
  CURRENT_GRANT_FETCHED,
  CURRENT_GRANT_LOADING,
} from "../actions/currentGrant";
import { MetaData } from "../types";

export interface CurrentGrantState {
  loading: boolean;
  currentGrant: MetaData | null;
}

export const initialState: CurrentGrantState = {
  loading: false,
  currentGrant: null,
};

export const currentGrantReducer = (
  state: CurrentGrantState = initialState,
  action: CurrentGrantActions
): CurrentGrantState => {
  switch (action.type) {
    case CURRENT_GRANT_FETCHED: {
      return {
        ...state,
        currentGrant: action.data,
      };
    }
    case CURRENT_GRANT_LOADING: {
      return {
        ...state,
        loading: action.status,
      };
    }

    default: {
      return state;
    }
  }
};
