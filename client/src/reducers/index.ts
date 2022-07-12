import { combineReducers } from "redux";
import {
  createRouterReducer,
  ReduxRouterState,
} from "@lagunovsky/redux-react-router";
import history from "../history";
import { Web3State, web3Reducer } from "./web3";
import { IPFSState, ipfsReducer } from "./ipfs";
import { ProjectsState, projectsReducer } from "./projects";
import { NewGrantState, newGrantReducer } from "./newGrant";
import { GrantsMetadataState, grantsMetadataReducer } from "./grantsMetadata";
import { RoundsState, roundsReducer } from "./rounds";

export interface RootState {
  router: ReduxRouterState;
  web3: Web3State;
  ipfs: IPFSState;
  projects: ProjectsState;
  newGrant: NewGrantState;
  grantsMetadata: GrantsMetadataState;
  rounds: RoundsState;
}

export const createRootReducer = () =>
  combineReducers({
    router: createRouterReducer(history),
    web3: web3Reducer,
    ipfs: ipfsReducer,
    projects: projectsReducer,
    newGrant: newGrantReducer,
    grantsMetadata: grantsMetadataReducer,
    rounds: roundsReducer,
  });
