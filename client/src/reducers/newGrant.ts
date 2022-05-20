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
  grants: NewGrant[];
  txStatus: string | null;
}

export const initialState: NewGrantState = {
  grants: [],
  txStatus: null,
};

export const newGrantReducer = (
  state: NewGrantState = initialState,
  action: NewGrantActions
): NewGrantState => {
  switch (action.type) {
    case NEW_GRANT_CREATED: {
      return {
        ...state,
        grants: [
          ...state.grants,
          {
            id: action.id,
            metaData: action.metaData,
            owner: action.owner,
          },
        ],
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
        txStatus: null,
      };
    }

    default: {
      return state;
    }
  }
};
