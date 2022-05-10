import { combineReducers } from 'redux';
import { createRouterReducer, ReduxRouterState } from "@lagunovsky/redux-react-router";
import { browserHistory } from "../history";
import {
  Web3State,
  web3Reducer,
} from './web3';
import {
  IPFSState,
  ipfsReducer,
} from './ipfs';
import {
  GrantState,
  grantReducer
} from './grants'

export interface RootState {
  web3: Web3State,
  ipfs: IPFSState,
  grants: GrantState,
  router: ReduxRouterState,
}

export const createRootReducer = () => combineReducers({
  router: createRouterReducer(browserHistory),
  web3: web3Reducer,
  ipfs: ipfsReducer,
  grants: grantReducer
});
