import { combineReducers } from "redux";
import { createRouterReducer, ReduxRouterState } from "@lagunovsky/redux-react-router";
import history from "../history";
import { Web3State, web3Reducer } from "./web3";


export interface RootState {
  router: ReduxRouterState;
  web3: Web3State,
};

export const createRootReducer = () => 
  combineReducers({
    router: createRouterReducer(history),
    web3: web3Reducer
  });