import {
  Web3Actions,
  WEB3_INITIALIZING,
  WEB3_INITIALIZED,
  WEB3_ERROR,
  WEB3_CHAIN_ID_LOADED,
  WEB3_ACCOUNT_LOADED,
} from "../actions/web3";

export interface Web3State {
  initializing: boolean;
  initialized: boolean;
  chainID: number | undefined;
  error: string | undefined;
  account: string | undefined;
}

const initialState: Web3State = {
  initializing: false,
  initialized: false,
  chainID: undefined,
  account: undefined,
  error: undefined
};


export const web3Reducer = (
  state: Web3State = initialState,
  action: Web3Actions
): Web3State => {
  
  switch (action.type) {
    
    case WEB3_INITIALIZING: {
      return {
        ...state,
        initializing: true,
        initialized: false,
        error: undefined
      }
    }

    case WEB3_INITIALIZED : {
      return {
        ...state,
        initializing: false,
        initialized: true,
        error: undefined
      }
    }

    case WEB3_CHAIN_ID_LOADED : {
      return {
        ...state,
        chainID: action.chainID
      }
    }

    case WEB3_ACCOUNT_LOADED : {
      return {
        ...state,
        account: action.account
      }
    }

    case WEB3_ERROR : {
      return {
        ...state,
        initializing: false,
        error: action.error
      }
    }

    default: {
      return state;
    }
  }
}