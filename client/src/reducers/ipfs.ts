import {
  IPFS_INITIALIZING,
  IPFS_INITIALIZATION_ERROR,
  IPFS_INITIALIZED,
  IPFS_FILE_SAVED,
  IPFSActions,
} from "../actions/ipfs";

export interface IPFSState {
  initializing: boolean;
  initialized: boolean;
  initializationError: string | undefined;
  lastFileSavedURL: string | undefined;
}

const initialState: IPFSState = {
  initializing: false,
  initialized: false,
  initializationError: undefined,
  lastFileSavedURL: undefined,
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

    case IPFS_FILE_SAVED: {
      return {
        ...state,
        lastFileSavedURL: action.url,
      };
    }
  }

  return state;
};
