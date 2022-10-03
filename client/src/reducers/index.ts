import { combineReducers } from "redux";
import {
  createRouterReducer,
  ReduxRouterState,
} from "@lagunovsky/redux-react-router";
import history from "../history";
import { Web3State, web3Reducer } from "./web3";
import { ProjectsState, projectsReducer } from "./projects";
import { NewGrantState, newGrantReducer } from "./newGrant";
import { GrantsMetadataState, grantsMetadataReducer } from "./grantsMetadata";
import { RoundsState, roundsReducer } from "./rounds";
import {
  RoundApplicationState,
  roundApplicationReducer,
} from "./roundApplication";
import { ProjectFormState, projectFormReducer } from "./projectForm";
import { UIState, uiReducer } from "./ui";

export interface RootState {
  router: ReduxRouterState;
  web3: Web3State;
  projects: ProjectsState;
  newGrant: NewGrantState;
  grantsMetadata: GrantsMetadataState;
  rounds: RoundsState;
  roundApplication: RoundApplicationState;
  projectForm: ProjectFormState;
  ui: UIState;
}

export const createRootReducer = () =>
  combineReducers({
    router: createRouterReducer(history),
    web3: web3Reducer,
    projects: projectsReducer,
    newGrant: newGrantReducer,
    grantsMetadata: grantsMetadataReducer,
    rounds: roundsReducer,
    roundApplication: roundApplicationReducer,
    projectForm: projectFormReducer,
    ui: uiReducer,
  });
