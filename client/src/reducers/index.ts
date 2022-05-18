import { combineReducers } from "redux";
import {
  createRouterReducer,
  ReduxRouterState,
} from "@lagunovsky/redux-react-router";
import history from "../history";
import { Web3State, web3Reducer } from "./web3";
import { IPFSState, ipfsReducer } from "./ipfs";
import { GrantsState, grantsReducer } from "./grants";
import { NewGrantState, newGrantReducer } from "./newGrant";
import { CurrentGrantState, currentGrantReducer } from "./currentGrant";

export interface RootState {
  router: ReduxRouterState;
  web3: Web3State;
  ipfs: IPFSState;
  grants: GrantsState;
  newGrant: NewGrantState;
  currentGrant: CurrentGrantState;
}

export const createRootReducer = () =>
  combineReducers({
    router: createRouterReducer(history),
    web3: web3Reducer,
    ipfs: ipfsReducer,
    grants: grantsReducer,
    newGrant: newGrantReducer,
    currentGrant: currentGrantReducer,
  });
