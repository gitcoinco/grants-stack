import {
  GrantsActions,
  GRANTS_LOADING,
  GRANTS_LOADED,
  GRANTS_UNLOADED,
} from "../actions/grants";

export interface GrantsState {
  loading: boolean;
  grants: number[];
}

const initialState = {
  loading: false,
  grants: [],
};

export const grantsReducer = (
  state: GrantsState = initialState,
  action: GrantsActions
): GrantsState => {
  switch (action.type) {
    case GRANTS_LOADING: {
      return {
        ...state,
        loading: true,
        grants: [],
      };
    }

    case GRANTS_LOADED: {
      const grants: number[] = action.grants;

      return {
        ...state,
        loading: false,
        grants,
      };
    }

    case GRANTS_UNLOADED: {
      return {
        ...state,
        loading: false,
        grants: [],
      };
    }
    default: {
      return state;
    }
  }
};
