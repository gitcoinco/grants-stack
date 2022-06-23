import {
  IPFS_INITIALIZING,
  IPFS_INITIALIZATION_ERROR,
  IPFS_INITIALIZED,
  PROJECT_FILE_SAVED,
  IPFS_SAVING_FILE,
  RESET_FILE_STATUS,
  PROJECT_IMG_SAVED,
  IPFSActions,
} from "../actions/ipfs";

export interface IPFSState {
  initializing: boolean;
  initialized: boolean;
  newFileSaved: boolean;
  ipfsSavingFile: boolean;
  initializationError: string | undefined;
  projectFileSavedCID: string | undefined;
  projectImgSavedCID: string | undefined;
}

const initialState: IPFSState = {
  initializing: false,
  initialized: false,
  newFileSaved: false,
  ipfsSavingFile: false,
  initializationError: undefined,
  projectFileSavedCID: undefined,
  projectImgSavedCID: undefined,
};

export const ipfsReducer = (
  state: IPFSState = initialState,
  action: IPFSActions
): IPFSState => {
  switch (action.type) {
    case IPFS_INITIALIZING: {
      return {
        ...state,
        initializing: true,
        initialized: false,
      };
    }

    case IPFS_INITIALIZATION_ERROR: {
      return {
        ...state,
        initializing: true,
        initialized: false,
        initializationError: action.error,
      };
    }

    case IPFS_INITIALIZED: {
      return {
        ...state,
        initializing: false,
        initialized: true,
      };
    }

    case PROJECT_FILE_SAVED: {
      return {
        ...state,
        projectFileSavedCID: action.cid,
        newFileSaved: true,
        ipfsSavingFile: false,
      };
    }

    case PROJECT_IMG_SAVED: {
      return {
        ...state,
        projectImgSavedCID: action.cid,
        newFileSaved: true,
        ipfsSavingFile: false,
      };
    }

    case IPFS_SAVING_FILE: {
      return {
        ...state,
        ipfsSavingFile: true,
      };
    }

    case RESET_FILE_STATUS: {
      return {
        ...state,
        newFileSaved: false,
        ipfsSavingFile: false,
        projectFileSavedCID: undefined,
      };
    }

    default: {
      return state;
    }
  }
};
