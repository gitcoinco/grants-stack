import { create as IPFSCreate } from "ipfs-core";
import { global } from "../global";
import { RootState } from "../reducers";
import { AppDispatch } from "../app/store";
import { useAppDispatch } from "../app/hooks";

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

export const IPFS_SAVING_FILE = "IPFS_SAVING_FILE";
export interface IPFSSavingFile {
  type: typeof IPFS_SAVING_FILE;
}

export const IPFS_FILE_SAVED = "IPFS_FILE_SAVED";
export interface IPFSFileSavedAction {
  type: typeof IPFS_FILE_SAVED;
  url: string;
}

export const IPFS_FETCHING_FILE = "IPFS_FETCHING_FILE";
export interface IPFSFetchingFile {
  type: typeof IPFS_FETCHING_FILE;
}

export const IPFS_FILE_FETCHED = "IPFS_FILE_FETCHED";
export interface IPFSFileFetchedAction {
  type: typeof IPFS_FILE_FETCHED;
  data: string;
}

export const RESET_FILE_STATUS = "RESET_FILE_STATUS";
export interface IPFSResetFileStatus {
  type: typeof RESET_FILE_STATUS;
}

export const IPFS_ERROR = "IPFS_ERROR";
export interface IPFSErrorAction {
  type: typeof IPFS_ERROR;
  error: string;
}

export type IPFSActions =
  | IPFSInitializingAction
  | IPFSInitializationErrorAction
  | IPFSInitializedAction
  | IPFSFileSavedAction
  | IPFSSavingFile
  | IPFSFetchingFile
  | IPFSFileFetchedAction
  | IPFSErrorAction
  | IPFSResetFileStatus;

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

const savingFile = (): IPFSActions => ({
  type: IPFS_SAVING_FILE,
});

const ipfsFileFetched = (data: string): IPFSActions => ({
  type: IPFS_FILE_FETCHED,
  data,
});

const fetchingFile = (): IPFSActions => ({
  type: IPFS_FETCHING_FILE,
});

export const resetFileStatus = (): IPFSActions => ({
  type: RESET_FILE_STATUS,
});

export const ipfsError = (error: string): IPFSActions => ({
  type: IPFS_ERROR,
  error
})

export const startIPFS =
  () => async (dispatch = useAppDispatch(), getState: () => RootState) => {
    const state = getState();
    if (state.ipfs.initializing || state.ipfs.initialized) {
      return;
    }

    if (global.ipfs !== undefined) {
      console.log("IPFS already started");
      return;
    }

    dispatch(ipfsInitializing());

    try {
      console.time("IPFS started");
      global.ipfs = await IPFSCreate();
      console.timeEnd("IPFS started");
      dispatch(ipfsInitialized());
    } catch (error) {
      if (error === "LockExistsError") {
        dispatch(ipfsInitialized());
        return;
      }

      console.error("ipfs error:", error);

      global.ipfs = undefined;
      dispatch(ipfsInitializationError(error));
    }
  };

export const saveFileToIPFS =
  (content: string, path?: string) => async (dispatch: AppDispatch) => {
    if (global.ipfs === undefined) {
      dispatch(resetFileStatus());
      return;
    }
    dispatch(savingFile());
    
    try {
      const res = await global.ipfs!.add({
        path,
        content,
      });

      dispatch(ipfsFileSaved(`https://ipfs.io/ipfs/${res.cid.toString()}`));
    } catch (e: string | any) {
      console.log("error", e);
      dispatch(ipfsError(e.toString()));
    }
  };

export const fetchFileFromIPFS =
  (cid: string) => async (dispatch: AppDispatch) => {
    if (global.ipfs === undefined) {
      dispatch(resetFileStatus());
      return;
    }
    dispatch(fetchingFile());

    const stream = global.ipfs!.cat(cid);
    let data = ""

    try {
      for await (const chunk of stream) {
        // chunks of data are returned as a Buffer, convert it back to a string
        data += chunk.toString();
      }
      dispatch(ipfsFileFetched(data));
    } catch (e: string | any) {
      console.log("error", e.toString());
      dispatch(ipfsError(e.toString()));
    }

  };