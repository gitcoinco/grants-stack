import {
  NewGrantActions,
  NEW_GRANT_CREATED,
  NEW_GRANT_STATUS,
  RESET_STATUS,
} from "../actions/newGrant";

export interface NewGrant {
  id: number;
  metaData: string;
  owner?: string;
}

export const enum Status {
  Undefined = 0,
  UploadingImages,
  UploadingJSON,
  WaitingForSignature,
  TransactionInitiated,
  Completed,
  Error,
}

export interface NewGrantState {
  status: Status;
  error: string | undefined;
}

export const initialState: NewGrantState = {
  status: Status.Undefined,
  error: undefined,
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

    case NEW_GRANT_STATUS: {
      return {
        ...state,
        status: action.status,
        error: action.error,
      };
    }

    case RESET_STATUS: {
      return {
        ...state,
        status: Status.Undefined,
      };
    }

    default: {
      return state;
    }
  }
};
