import {
  NewGrantActions,
  GrantError,
  NEW_GRANT_CREATED,
  NEW_GRANT_ERROR,
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

export type NewGrantError = {
  error: string;
  step: Status;
};

export interface NewGrantState {
  status: Status;
  error: NewGrantError | undefined;
}

export const initialState: NewGrantState = {
  status: Status.Undefined,
  error: undefined,
};

export const newGrantReducer = (
  state: NewGrantState = initialState,
  action: NewGrantActions | GrantError
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
        error: undefined,
      };
    }

    case NEW_GRANT_ERROR: {
      return {
        ...state,
        status: Status.Error,
        error: {
          error: action.error,
          step: action.step,
        },
      };
    }

    case RESET_STATUS: {
      return {
        ...state,
        status: Status.Undefined,
        error: undefined,
      };
    }

    default: {
      return state;
    }
  }
};
