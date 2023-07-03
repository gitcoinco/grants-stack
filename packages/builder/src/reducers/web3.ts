import { ChainId } from "common";
import {
  Web3Actions,
  WEB3_INITIALIZING,
  WEB3_INITIALIZED,
  WEB3_ERROR,
  WEB3_CHAIN_ID_LOADED,
  WEB3_ACCOUNT_LOADED,
  Web3Errors,
} from "../actions/web3";

export interface Web3State {
  initializing: boolean;
  initialized: boolean;
  chainID: ChainId | undefined;
  error: Web3Errors | undefined;
  account: string | undefined;
}

const initialState: Web3State = {
  initializing: true,
  initialized: false,
  chainID: undefined,
  error: undefined,
  account: undefined,
};

export const web3Reducer = (
  state: Web3State = initialState,
  action: Web3Actions
): Web3State => {
  switch (action.type) {
    case WEB3_INITIALIZING: {
      return {
        ...state,
        error: undefined,
        initializing: true,
        initialized: false,
      };
    }

    case WEB3_INITIALIZED: {
      return {
        ...state,
        error: undefined,
        initializing: false,
        initialized: true,
      };
    }

    case WEB3_ERROR: {
      return {
        ...state,
        initializing: false,
        error: action.error,
      };
    }

    case WEB3_CHAIN_ID_LOADED: {
      return {
        ...state,
        chainID: action.chainID,
      };
    }

    case WEB3_ACCOUNT_LOADED: {
      return {
        ...state,
        account: action.account,
      };
    }
  }

  return state;
};
