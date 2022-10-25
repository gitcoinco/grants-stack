import { BigNumber, ethers } from "ethers";
import { Dispatch } from "redux";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { addressesByChainID } from "../contracts/deployments";
import { global } from "../global";
import { RootState } from "../reducers";
// import { RoundProject } from "../reducers/projects";
import { ProjectEventsMap } from "../types";
import { ChainId, graphqlFetch } from "../utils/graphql";
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

export const PROJECT_APPLICATIONS_LOADING = "PROJECT_APPLICATIONS_LOADING";
interface ProjectApplicationsLoadingAction {
  type: typeof PROJECT_APPLICATIONS_LOADING;
  // projectID: string;
  // roundID: string;
}

export const PROJECT_APPLICATIONS_NOT_FOUND = "PROJECT_APPLICATIONS_NOT_FOUND";
interface ProjectApplicationsNotFoundAction {
  type: typeof PROJECT_APPLICATIONS_NOT_FOUND;
  projectID: string;
  roundID: string;
}

export const PROJECT_APPLICATIONS_LOADED = "PROJECT_APPLICATIONS_LOADED";
interface ProjectApplicationsLoadedAction {
  type: typeof PROJECT_APPLICATIONS_LOADED;
  projectID: string;
  applications: any;
}

export const PROJECT_APPLICATIONS_ERROR = "PROJECT_APPLICATIONS_ERROR";
interface ProjectApplicationsErrorAction {
  type: typeof PROJECT_APPLICATIONS_ERROR;
  projectID: string;
  error: string;
}

export type ProjectsActions =
  | ProjectsLoadingAction
  | ProjectsLoadedAction
  | ProjectsUnloadedAction
  | ProjectApplicationsLoadingAction
  | ProjectApplicationsNotFoundAction
  | ProjectApplicationsLoadedAction
  | ProjectApplicationsErrorAction;

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

export const getRoundProjectsApplied =
  (projectID: string, chainId: ChainId) => async (dispatch: Dispatch) => {
    dispatch({
      type: PROJECT_APPLICATIONS_LOADING,
      projectID,
    });

    try {
      console.log("fetching graphql project data");
      const applicationsFound: any = await graphqlFetch(
        `query roundProjects($projectID: String) {
          roundProjects(where: { project: $projectID }) {
            project
            status
            round {
              id
            }
          }
        }
        `,
        chainId,
        { projectID }
      );
      console.log("applicationsFound", applicationsFound);

      dispatch({
        type: PROJECT_APPLICATIONS_LOADED,
        projectID,
        applications: applicationsFound.data.roundProjects,
      });
    } catch (error: any) {
      dispatch({
        type: PROJECT_APPLICATIONS_ERROR,
        projectID,
        error,
      });
    }
  };

export const unloadProjects = () => projectsUnload();
