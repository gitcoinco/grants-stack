import { BigNumber, ethers } from "ethers";
import { Dispatch } from "redux";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { addressesByChainID } from "../contracts/deployments";
import { global } from "../global";
import { RootState } from "../reducers";
import { ProjectEventsMap } from "../types";
import { fetchGrantData } from "./grantsMetadata";

export const PROJECTS_LOADING = "PROJECTS_LOADING";
interface ProjectsLoadingAction {
  type: typeof PROJECTS_LOADING;
}

export const PROJECTS_LOADED = "PROJECTS_LOADED";
interface ProjectsLoadedAction {
  type: typeof PROJECTS_LOADED;
  events: ProjectEventsMap;
}

export const PROJECTS_UNLOADED = "PROJECTS_UNLOADED";
export interface ProjectsUnloadedAction {
  type: typeof PROJECTS_UNLOADED;
}

export type ProjectsActions =
  | ProjectsLoadingAction
  | ProjectsLoadedAction
  | ProjectsUnloadedAction;

const projectsLoading = () => ({
  type: PROJECTS_LOADING,
});

const projectsLoaded = (events: ProjectEventsMap) => ({
  type: PROJECTS_LOADED,
  events,
});

const projectsUnload = () => ({
  type: PROJECTS_UNLOADED,
});

export const loadProjects =
  (withMetaData?: boolean) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(projectsLoading());

    const state = getState();
    const { chainID } = state.web3;

    const addresses = addressesByChainID(chainID!);
    const contract = new ethers.Contract(
      addresses.projectRegistry,
      ProjectRegistryABI,
      global.web3Provider!
    );

    const createdFilter = contract.filters.ProjectCreated(
      null,
      state.web3.account
    );

    const createdEvents = await contract.queryFilter(createdFilter);
    if (createdEvents.length === 0) {
      dispatch(projectsLoaded({}));
      return;
    }

    const ids = createdEvents.map((event) => event.args!.projectID!.toNumber());
    const hexIDs = createdEvents.map((event) =>
      event.args!.projectID!.toHexString()
    );

    if (withMetaData) {
      ids.map((id) => dispatch<any>(fetchGrantData(id)));
    }

    const updatedFilter = contract.filters.MetadataUpdated(hexIDs);
    const updatedEvents = await contract.queryFilter(updatedFilter);

    const events: ProjectEventsMap = {};

    createdEvents.forEach((createEvent) => {
      const id = createEvent.args!.projectID!;
      events[id] = {
        createdAtBlock: createEvent.blockNumber,
        updatedAtBlock: undefined,
      };
    });

    updatedEvents.forEach((updateEvent) => {
      const id = BigNumber.from(updateEvent.args!.projectID!).toNumber();
      const event = events[id];
      if (event !== undefined) {
        event.updatedAtBlock = updateEvent.blockNumber;
      }
    });

    dispatch(projectsLoaded(events));
  };

export const unloadProjects = () => projectsUnload();
