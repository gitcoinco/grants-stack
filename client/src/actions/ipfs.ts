import { IPFS, create as IPFSCreate } from "ipfs-core";
import { Dispatch } from "redux";
import { RootState } from "../reducers";

let ipfs: IPFS | null = null;

export const IPFS_INITIALIZING = "IPFS_INITIALIZING";
export interface IPFSInitializingAction {
  type: typeof IPFS_INITIALIZING;
}

export const IPFS_INITIALIZATION_ERROR = "IPFS_INITIALIZATION_ERROR";
export interface IPFSInitializationErrorAction {
  type: typeof IPFS_INITIALIZATION_ERROR;
  error: any;
}

export const IPFS_INITIALIZED = "IPFS_INITIALIZED";
export interface IPFSInitializedAction {
  type: typeof IPFS_INITIALIZED;
}

export const IPFS_FILE_SAVED = "IPFS_FILE_SAVED";
export interface IPFSFileSavedAction {
  type: typeof IPFS_FILE_SAVED;
  url: string;
}

export type IPFSActions =
  | IPFSInitializingAction
  | IPFSInitializationErrorAction
  | IPFSInitializedAction
  | IPFSFileSavedAction;

const ipfsInitializing = (): IPFSActions => ({
  type: IPFS_INITIALIZING,
});

const ipfsInitializationError = (error: any): IPFSActions => ({
  type: IPFS_INITIALIZATION_ERROR,
  error,
});

const ipfsInitialized = (): IPFSActions => ({
  type: IPFS_INITIALIZED,
});

const ipfsFileSaved = (url: string): IPFSActions => ({
  type: IPFS_FILE_SAVED,
  url,
});

export const startIPFS =
  () => async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    if (state.ipfs.initializing || state.ipfs.initialized) {
      return;
    }

    if (ipfs !== null) {
      console.log("IPFS already started");
      return;
    }

    dispatch(ipfsInitializing());

    try {
      console.time("IPFS started");
      ipfs = await IPFSCreate();
      console.timeEnd("IPFS started");
      dispatch(ipfsInitialized());
    } catch (error) {
      if (error === "LockExistsError") {
        dispatch(ipfsInitialized());
        return;
      }

      console.error("ipfs error:", error);

      ipfs = null;
      dispatch(ipfsInitializationError(error));
    }
  };

export const saveFileToIPFS =
  (path: string, content: string) => async (dispatch: Dispatch) => {
    if (ipfs === null) {
      return;
    }

    const res = await ipfs!.add({
      path,
      content,
    });

    dispatch(ipfsFileSaved(`https://ipfs.io/ipfs/${res.cid.toString()}`));
  };
