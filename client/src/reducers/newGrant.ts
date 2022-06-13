import {
  NewGrantActions,
  NEW_GRANT_CREATED,
  NEW_GRANT_TX_STATUS,
  RESET_TX_STATUS,
} from "../actions/newGrant";

export interface NewGrant {
  id: number;
  metaData: string;
  owner?: string;
}
export interface NewGrantState {
  txStatus: string | undefined;
}

export const initialState: NewGrantState = {
  txStatus: undefined,
};

export const newGrantReducer = (
  state: NewGrantState = initialState,
  action: NewGrantActions
): NewGrantState => {
  switch (action.type) {
    case NEW_GRANT_CREATED: {
      return {
        ...state,
      };
    }

    case NEW_GRANT_TX_STATUS: {
      return {
        ...state,
        txStatus: action.status,
      };
    }

    case RESET_TX_STATUS: {
      return {
        ...state,
        txStatus: undefined,
      };
    }

    default: {
      return state;
    }
  }
};
