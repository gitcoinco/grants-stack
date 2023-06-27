import { Dispatch } from "redux";
import { ChainId } from "common";
import { global } from "../global";
import { chains } from "../contracts/deployments";

const chainIds = Object.keys(chains);

export enum Web3Type {
  Generic,
  Remote,
  Status,
}

export const WEB3_INITIALIZING = "WEB3_INITIALIZING";
export interface Web3InitializingAction {
  type: typeof WEB3_INITIALIZING;
}

export const WEB3_INITIALIZED = "WEB3_INITIALIZED";
export interface Web3InitializedAction {
  type: typeof WEB3_INITIALIZED;
  web3Type: Web3Type;
}

export const WEB3_ERROR = "WEB3_ERROR";
export interface Web3ErrorAction {
  type: typeof WEB3_ERROR;
  error: string;
}

export const WEB3_CHAIN_ID_LOADED = "WEB3_CHAIN_ID_LOADED";
export interface Web3ChainIDLoadedAction {
  type: typeof WEB3_CHAIN_ID_LOADED;
  chainID: ChainId;
}

export const WEB3_ACCOUNT_LOADED = "WEB3_ACCOUNT_LOADED";
export interface Web3AccountLoadedAction {
  type: typeof WEB3_ACCOUNT_LOADED;
  account: string;
}

export const WEB3_ACCOUNT_DISCONNECTED = "WEB3_ACCOUNT_DISCONNECTED";
export interface Web3AccountDisconnectedAction {
  type: typeof WEB3_ACCOUNT_DISCONNECTED;
  account: string;
}

export const WEB3_BAD_CHAIN_ERROR = "WEB3_BAD_CHAIN_ERROR";
export type Web3Errors = typeof WEB3_ERROR | string;

export type Web3Actions =
  | Web3InitializingAction
  | Web3InitializedAction
  | Web3ErrorAction
  | Web3ChainIDLoadedAction
  | Web3AccountLoadedAction
  | Web3AccountDisconnectedAction;

export const web3Initializing = (): Web3Actions => ({
  type: WEB3_INITIALIZING,
});

export const web3Initialized = (t: Web3Type): Web3Actions => ({
  type: WEB3_INITIALIZED,
  web3Type: t,
});

export const web3ChainIDLoaded = (id: number): Web3Actions => ({
  type: WEB3_CHAIN_ID_LOADED,
  chainID: id,
});

export const web3Error = (error: string): Web3Actions => ({
  type: WEB3_ERROR,
  error,
});

export const web3AccountLoaded = (account: string): Web3Actions => ({
  type: WEB3_ACCOUNT_LOADED,
  account,
});

export const notWeb3Browser = (): Web3Actions => ({
  type: WEB3_ERROR,
  error: "not a web3 browser",
});

export const web3AccountDisconnected = (account: string): Web3Actions => ({
  type: WEB3_ACCOUNT_DISCONNECTED,
  account,
});

export const initializeWeb3 =
  (signer: any, provider: any, chain: any, address: string) =>
  (dispatch: Dispatch) => {
    let t: Web3Type;
    if (window.ethereum) {
      t = window.ethereum.isStatus ? Web3Type.Status : Web3Type.Generic;
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    } else {
      t = Web3Type.Remote;
    }

    if (!chainIds.includes(String(chain?.id))) {
      dispatch(web3Error(WEB3_BAD_CHAIN_ERROR));
      return;
    }

    global.signer = signer;
    global.web3Provider = provider;
    global.chainID = chain?.id;
    global.address = address;

    dispatch(web3Initialized(t));
    dispatch(web3AccountLoaded(address));
    dispatch(web3ChainIDLoaded(chain?.id));
  };
