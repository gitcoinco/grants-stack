import {
  ROUND_APPLICATION_LOADING,
  ROUND_APPLICATION_ERROR,
  ROUND_APPLICATION_LOADED,
  RoundApplicationActions,
} from "../actions/roundApplication";

export const enum Status {
  Undefined = 0,
  BuildingApplication,
  UploadingMetadata,
  SendingTx,
  Sent,
  Error,
}

export interface RoundApplicationState {
  [roundAddress: string]: {
    status: Status;
    error: string | undefined;
  };
}

const initialState = {};

const roundApplicationInitialState = {
  status: Status.Undefined,
  error: undefined,
};

export const roundApplicationReducer = (
  state: RoundApplicationState = initialState,
  action: RoundApplicationActions
): RoundApplicationState => {
  switch (action.type) {
    case ROUND_APPLICATION_LOADING: {
      const application =
        state[action.roundAddress] || roundApplicationInitialState;
      return {
        ...state,
        [action.roundAddress]: {
          ...application,
          status: action.status,
        },
      };
    }

    case ROUND_APPLICATION_ERROR: {
      const application =
        state[action.roundAddress] || roundApplicationInitialState;
      return {
        ...state,
        [action.roundAddress]: {
          ...application,
          status: Status.Error,
          error: action.error,
        },
      };
    }

    case ROUND_APPLICATION_LOADED: {
      const application =
        state[action.roundAddress] || roundApplicationInitialState;
      return {
        ...state,
        [action.roundAddress]: {
          ...application,
          status: Status.Sent,
          error: undefined,
        },
      };
    }

    default: {
      return state;
    }
  }
};
