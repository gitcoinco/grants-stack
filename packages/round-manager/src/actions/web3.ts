import { ethers } from "ethers";
import { global } from "../global";
import { Dispatch } from "redux";
import { RootState } from "../reducers";

export const VALID_NETWORK_NAME = "Goerli";
export const VALID_CHAIN_ID = 5;
export const LOCAL_CHAIN_ID = 1337;

enum Web3Type {
  Generic,
  Remote,
  Status,
}

// Interfaces

export const WEB3_INITIALIZING = "WEB3_INITIALIZING";
export interface Web3InitializingAction {
  type: typeof WEB3_INITIALIZING
};

export const WEB3_INITIALIZED = "WEB3_INITIALIZED";
export interface Web3InitializedAction {
  type: typeof WEB3_INITIALIZED;
  web3Type: Web3Type;
}

export const WEB3_CHAIN_ID_LOADED = "WEB3_CHAIN_ID_LOADED";
export interface Web3ChainIDLoadedAction {
  type: typeof WEB3_CHAIN_ID_LOADED;
  chainID: number
}

export const WEB3_ACCOUNT_LOADED = "WEB3_ACCOUNT_LOADED";
export interface Web3AccountLoadedAction {
  type: typeof WEB3_ACCOUNT_LOADED;
  account: string;
}

export const WEB3_ERROR = "WEB3_ERROR";
export interface Web3ErrorAction {
  type: typeof WEB3_ERROR;
  error: string;
}

// Web3 Actions

export type Web3Actions =
  | Web3InitializingAction
  | Web3InitializedAction
  | Web3ChainIDLoadedAction
  | Web3AccountLoadedAction
  | Web3ErrorAction;


// Defining individual Web3Action

export const web3Initializing = () : Web3Actions => ({
  type: WEB3_INITIALIZING
});

export const web3Initialized = (t: Web3Type): Web3Actions => ({
  type: WEB3_INITIALIZED,
  web3Type: t
})

export const web3ChainIDLoaded = (chainID: number): Web3Actions => ({
  type: WEB3_CHAIN_ID_LOADED,
  chainID: chainID
})

export const web3AccountLoaded = (account: string): Web3Actions => ({
  type: WEB3_ACCOUNT_LOADED,
  account: account
})

export const web3Error = (error: string): Web3Actions => ({
  type: WEB3_ERROR,
  error: error
})

export const notWeb3Browser = (): Web3Actions => ({
  type: WEB3_ERROR,
  error: "not a web3 browser",
});


declare global {
  interface Window {
    ethereum: any;
  }
}


const loadWeb3Data = () => (dispatch: Dispatch) => {
  global.web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  global.web3Provider!.getNetwork().then(({ chainId }) => {
    if (chainId !== VALID_CHAIN_ID && chainId !== LOCAL_CHAIN_ID) {
      dispatch(
        web3Error(`wrong network, please connect to ${VALID_NETWORK_NAME}`)
      );
      return;
    }

    dispatch(web3ChainIDLoaded(chainId));
  });
};

// Dispatches Web3Actions while attempting to initialize web3 instance on the browser
export const initializeWeb3 = () => {
  
  if (!window.ethereum) {
    return notWeb3Browser();
  }

  return (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();

    if (state.web3.initializing || state.web3.initialized) {
      return;
    }

    dispatch(web3Initializing());

    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts: Array<string>) => {
        const t: Web3Type = window.ethereum.isStatus
          ? Web3Type.Status
          : Web3Type.Generic;

        dispatch(web3Initialized(t));

        if (accounts.length > 0) {
          dispatch(web3AccountLoaded(accounts[0]));
        }

        // FIXME: fix dispatch<any>
        window.ethereum.on("chainChanged", () => window.location.reload());
        dispatch<any>(loadWeb3Data());
      })
      .catch((err: string) => {
        console.log("error", err);
        dispatch(web3Error("Unable to connect web3 account"));
      });

  }
  
}