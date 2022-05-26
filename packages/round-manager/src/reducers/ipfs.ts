import {
    IPFS_INITIALIZING,
    IPFS_INITIALIZATION_ERROR,
    IPFS_INITIALIZED,
    IPFS_FILE_SAVED,
    IPFS_SAVING_FILE,
    IPFS_FILE_FETCHED,
    IPFS_FETCHING_FILE,
    IPFS_ERROR,
    RESET_FILE_STATUS,
    IPFSActions,
  } from "../actions/ipfs";
  
  export interface IPFSState {
    initializing: boolean;
    initialized: boolean;
    newFileSaved: boolean;
    ipfsSavingFile: boolean;
    ipfsFetchingFile: boolean;
    initializationError?: string;
    lastFileSavedURL?: string;
    lastFileFetched?: string;
    error?: string;
  }
  
  const initialState: IPFSState = {
    initializing: false,
    initialized: false,
    newFileSaved: false,
    ipfsSavingFile: false,
    ipfsFetchingFile: false,
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
          newFileSaved: true,
          ipfsSavingFile: false,
          error: undefined,
        };
      }
  
      case IPFS_SAVING_FILE: {
        return {
          ...state,
          ipfsSavingFile: true,
          error: undefined,
        };
      }

      case IPFS_FILE_FETCHED: {
        return {
          ...state,
          lastFileFetched: action.data,
          ipfsFetchingFile: false,
          error: undefined,
        };
      }
  
      case IPFS_FETCHING_FILE: {
        return {
          ...state,
          ipfsFetchingFile: true,
          error: undefined,
        };
      }
  
      case RESET_FILE_STATUS: {
        return {
          ...state,
          newFileSaved: false,
          ipfsSavingFile: false,
          ipfsFetchingFile: false,
          lastFileFetched: undefined,
        };
      }

      case IPFS_ERROR: {
        return {
          ...state,
          error: action.error
        };
      }
  
      default: {
        return state;
      }
    }
  };