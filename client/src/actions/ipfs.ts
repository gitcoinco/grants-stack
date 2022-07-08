import { create as IPFSCreate } from "ipfs-core";
import { Dispatch } from "redux";
import { RootState } from "../reducers";
import { global } from "../global";

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

export enum FileTypes {
  IMG = "IMG",
  PROJECT = "PROJECT",
}
export const PROJECT_FILE_SAVED = "IPFS_FILE_SAVED";
export interface ProjectFileSavedAction {
  type: typeof PROJECT_FILE_SAVED;
  cid: string;
}

export const PROJECT_IMG_SAVED = "PROJECT_IMG_SAVED";
export interface ProjectIMGSavedAction {
  type: typeof PROJECT_IMG_SAVED;
  cid: string;
}

export const RESET_FILE_STATUS = "RESET_FILE_STATUS";
export interface IPFSResetFileStatus {
  type: typeof RESET_FILE_STATUS;
}

export type IPFSActions =
  | IPFSInitializingAction
  | IPFSInitializationErrorAction
  | IPFSInitializedAction
  | ProjectFileSavedAction
  | ProjectIMGSavedAction
  | IPFSSavingFile
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

const projectFileSaved = (cid: string): IPFSActions => ({
  type: PROJECT_FILE_SAVED,
  cid,
});

const projectIMGSaved = (cid: string): IPFSActions => ({
  type: PROJECT_IMG_SAVED,
  cid,
});

const savingFile = (): IPFSActions => ({
  type: IPFS_SAVING_FILE,
});

export const resetFileStatus = (): IPFSActions => ({
  type: RESET_FILE_STATUS,
});

export const startIPFS =
  () => async (dispatch: Dispatch, getState: () => RootState) => {
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

interface Inputs {
  title: string;
  description: string;
  website: string;
  challenges: string;
  roadmap: string;
}

export const saveFileToIPFS =
  (content: Inputs | Buffer, fileType: FileTypes, currentProjectId?: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    dispatch(savingFile());
    if (global.ipfs === undefined) {
      return;
    }

    const fullContent: any = content;

    const id = Number(currentProjectId);

    if (currentProjectId !== undefined && state.grantsMetadata[id]) {
      fullContent.projectImg = state.grantsMetadata[id].metadata?.projectImg;
    }

    if (state.ipfs.projectImgSavedCID) {
      fullContent.projectImg = state.ipfs.projectImgSavedCID;
    }

    if (fileType === FileTypes.IMG) {
      const imgBuffer = fullContent as Buffer;
      const res = await global.ipfs!.add({
        content: imgBuffer,
      });
      dispatch(projectIMGSaved(res.cid.toString()));
    } else {
      const res = await global.ipfs!.add({
        content: JSON.stringify(fullContent),
      });
      dispatch(projectFileSaved(res.cid.toString()));
    }
  };
