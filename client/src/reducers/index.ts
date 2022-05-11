import { combineReducers } from "redux";
import { createRouterReducer, ReduxRouterState } from "@lagunovsky/redux-react-router";
import { history } from "../history";
import {
  Web3State,
  web3Reducer,
} from "./web3";
import {
  IPFSState,
  ipfsReducer,
} from "./ipfs";
import {
  NewGrantState,
  newGrantReducer
} from "./newGrant";

export interface RootState {
  web3: Web3State,
  ipfs: IPFSState,
  newGrant: NewGrantState,
  router: ReduxRouterState,
}

export const createRootReducer = () => combineReducers({
  router: createRouterReducer(history),
  web3: web3Reducer,
  ipfs: ipfsReducer,
  newGrant: newGrantReducer
});
