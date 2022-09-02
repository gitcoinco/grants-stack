import {
  ROUND_APPLICATION_LOADING,
  ROUND_APPLICATION_ERROR,
  ROUND_APPLICATION_LOADED,
  ROUND_APPLICATION_FOUND,
  ROUND_APPLICATION_NOT_FOUND,
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
    projectsIDs: Array<number>; // projects IDs that applied to the round
  };
}

const initialState = {};

const roundApplicationInitialState = {
  status: Status.Undefined,
  error: undefined,
  applied: false,
  projectsIDs: [],
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

    case ROUND_APPLICATION_FOUND: {
      const application =
        state[action.roundAddress] || roundApplicationInitialState;
      return {
        ...state,
        [action.roundAddress]: {
          ...application,
          projectsIDs: [...application.projectsIDs, action.projectID],
        },
      };
    }

    // In case a a round application for a specific round is not found
    // we initialize the roundApplication to specify that it has been fetched.
    // If it's undefined it means we didn't fetch it yet.
    case ROUND_APPLICATION_NOT_FOUND: {
      const application =
        state[action.roundAddress] || roundApplicationInitialState;
      return {
        ...state,
        [action.roundAddress]: {
          ...application,
        },
      };
    }

    default: {
      return state;
    }
  }
};
