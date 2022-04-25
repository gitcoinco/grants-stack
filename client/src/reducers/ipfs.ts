import {
  IPFS_INITIALIZING,
  IPFS_INITIALIZATION_ERROR,
  IPFS_INITIALIZED,
  IPFSActions,
} from "../actions/ipfs";

export interface IPFSState {
  initializing: boolean
  initialized: boolean
  initializationError: string | undefined
}

const initialState: IPFSState = {
  initializing: false,
  initialized: false,
  initializationError: undefined,
};

export const ipfsReducer = (state: IPFSState = initialState, action: IPFSActions): IPFSState => {
  switch (action.type) {
    case IPFS_INITIALIZING: {
      return {
        ...state,
        initializing: true,
        initialized: false,
      }
    }

    case IPFS_INITIALIZATION_ERROR: {
      return {
        ...state,
        initializing: true,
        initialized: false,
        initializationError: action.error,
      }
    }

    case IPFS_INITIALIZED: {
      return {
        ...state,
        initializing: false,
        initialized: true,
      }
    }
  }

  return state;
}
