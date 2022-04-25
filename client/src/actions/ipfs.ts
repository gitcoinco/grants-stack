import { IPFS, create as IPFSCreate } from 'ipfs-core';
import {
  Dispatch,
} from 'redux';
import { RootState } from '../reducers';

let ipfs: IPFS | null = null;

export const IPFS_INITIALIZING = "IPFS_INITIALIZING";
export interface IPFSInitializingAction {
  type: typeof IPFS_INITIALIZING
}

export const IPFS_INITIALIZATION_ERROR = "IPFS_INITIALIZATION_ERROR";
export interface IPFSInitializationErrorAction {
  type: typeof IPFS_INITIALIZATION_ERROR,
  error: any
}

export const IPFS_INITIALIZED = "IPFS_INITIALIZED";
export interface IPFSInitializedAction {
  type: typeof IPFS_INITIALIZED
}

export type IPFSActions =
  IPFSInitializingAction |
  IPFSInitializationErrorAction |
  IPFSInitializedAction;

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

export const startIPFS = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    if (ipfs !== null) {
      console.log('IPFS already started');
      return;
    }

    dispatch(ipfsInitializing());

    try {
      console.time('IPFS started');
      ipfs = await IPFSCreate();
      console.timeEnd('IPFS started');
      dispatch(ipfsInitialized());
    } catch (error) {
      if (error === "LockExistsError") {
        dispatch(ipfsInitialized());
        return;
      }

      ipfs = null;
      dispatch(ipfsInitializationError(error));
    } finally {
      const res = await ipfs!.add({
        path: 'hello.txt',
        content: `Hello World ${new Date()}`
      })
      console.log("%%%", res.cid.toString())
    }
  };
};
