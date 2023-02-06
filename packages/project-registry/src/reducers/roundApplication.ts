import {
  APPLICATION_DATA_LOADED,
  RoundApplicationActions,
  ROUND_APPLICATION_ERROR,
  ROUND_APPLICATION_ERROR_RESET,
  ROUND_APPLICATION_FOUND,
  ROUND_APPLICATION_LOADED,
  ROUND_APPLICATION_LOADING,
  ROUND_APPLICATION_NOT_FOUND,
  ROUND_APPLICATION_RESET,
} from "../actions/roundApplication";

export const enum Status {
  Undefined = 0,
  BuildingApplication,
  LitAuthentication,
  SigningApplication,
  UploadingMetadata,
  SendingTx,
  Sent,
  Found,
  NotFound,
  Error,
}

export const enum ApplicationModalStatus {
  Undefined = 0,
  NotApplied,
  Applied,
  Closed,
}

export type RoundApplicationError = {
  error: string;
  step: Status;
};

export type RoundApplicationState = {
  [roundAddress: string]: {
    status: Status;
    error?: RoundApplicationError;
    projectsIDs: Array<number>; // projects IDs that applied to the round
    metadataFromIpfs?: {
      [ipfsHash: string]: {
        publishedApplicationData: any;
        status: Status;
        error?: any;
      };
    };
  };
};

const initialState = {};

const roundApplicationInitialState = {
  status: Status.Undefined,
  error: undefined,
  projectsIDs: [],
  metadataFromIpfs: {},
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
          error: undefined,
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
          error: {
            error: action.error,
            step: action.step,
          },
        },
      };
    }

    case ROUND_APPLICATION_ERROR_RESET: {
      const application =
        state[action.roundAddress] || roundApplicationInitialState;
      return {
        ...state,
        [action.roundAddress]: {
          ...application,
          // TODO : Retry step from previous application error step
          // status: application.error?.step || 0,
          error: undefined,
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
          projectsIDs: [action.projectId, ...application.projectsIDs],
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
          status: Status.Found,
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
          status: Status.NotFound,
        },
      };
    }

    case ROUND_APPLICATION_RESET: {
      const application = state[action.roundAddress];
      if (application === undefined) {
        return state;
      }

      return {
        ...state,
        [action.roundAddress]: {
          ...application,
          status: Status.Undefined,
        },
      };
    }

    case APPLICATION_DATA_LOADED: {
      const application =
        state[action.roundAddress] || roundApplicationInitialState;
      return {
        ...state,
        [action.roundAddress]: {
          ...application,
          metadataFromIpfs: {
            [action.ipfsHash]: {
              publishedApplicationData: action.applicationData,
              status: Status.Found,
            },
          },
        },
      };
    }

    default: {
      return state;
    }
  }
};
