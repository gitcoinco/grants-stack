import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { ethers } from "ethers";
import { Dispatch } from "redux";
// import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import RoundImplementationABI from "../contracts/abis/RoundImplementation.json";
import { addressesByChainID } from "../contracts/deployments";
import { global } from "../global";
import { RootState } from "../reducers";
import { Application, AppStatus } from "../reducers/projects";
import PinataClient from "../services/pinata";
import { ProjectEvents, ProjectEventsMap } from "../types";
import { graphqlFetch } from "../utils/graphql";
import generateUniqueRoundApplicationID from "../utils/roundApplication";
import { getProviderByChainId } from "../utils/utils";
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

export const PROJECTS_ERROR = "PROJECTS_ERROR";
interface ProjectsErrorAction {
  type: typeof PROJECTS_ERROR;
  error: string;
}

export const PROJECTS_UNLOADED = "PROJECTS_UNLOADED";
export interface ProjectsUnloadedAction {
  type: typeof PROJECTS_UNLOADED;
}

export const PROJECT_APPLICATIONS_LOADING = "PROJECT_APPLICATIONS_LOADING";
interface ProjectApplicationsLoadingAction {
  type: typeof PROJECT_APPLICATIONS_LOADING;
  projectID: string;
}

export const PROJECT_APPLICATIONS_LOADED = "PROJECT_APPLICATIONS_LOADED";
interface ProjectApplicationsLoadedAction {
  type: typeof PROJECT_APPLICATIONS_LOADED;
  projectID: string;
  applications: Application[];
}

export const PROJECT_APPLICATION_UPDATED = "PROJECT_APPLICATION_UPDATED";
interface ProjectApplicationUpdatedAction {
  type: typeof PROJECT_APPLICATION_UPDATED;
  projectID: string;
  roundID: string;
  status: AppStatus;
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
  | ProjectsErrorAction
  | ProjectsUnloadedAction
  | ProjectApplicationsLoadingAction
  | ProjectApplicationsLoadedAction
  | ProjectApplicationsErrorAction
  | ProjectApplicationUpdatedAction;

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

const fetchProjectCreatedUpdatedEvents = async (
  chainID: number,
  account: string
) => {
  const addresses = addressesByChainID(chainID!);

  const appProvider = getProviderByChainId(chainID);

  // FIXME: use contract filters when fantom bug is fixed
  // const contract = new ethers.Contract(
  //   addresses.projectRegistry,
  //   ProjectRegistryABI,
  //   global.web3Provider!
  // );

  // FIXME: use this line when the fantom RPC bug has been fixed
  // const createdFilter = contract.filters.ProjectCreated(null, account) as any;
  const createdEventSig = ethers.utils.id("ProjectCreated(uint256,address)");
  const createdFilter = {
    address: addresses.projectRegistry,
    fromBlock: "0x00",
    toBlock: "latest",
    topics: [createdEventSig, null, ethers.utils.hexZeroPad(account, 32)],
  };

  // FIXME: remove when the fantom RPC bug has been fixed
  if (chainID === 250 || chainID === 4002) {
    createdFilter.address = undefined;
  }

  // FIXME: use queryFilter when the fantom RPC bug has been fixed
  // const createdEvents = await contract.queryFilter(createdFilter);
  let createdEvents = await appProvider!.getLogs(createdFilter);

  // FIXME: remove when the fantom RPC bug has been fixed
  createdEvents = createdEvents.filter(
    (e) => e.address === addresses.projectRegistry
  );

  if (createdEvents.length === 0) {
    return {
      createdEvents: [],
      updatedEvents: [],
      ids: [],
    };
  }

  // FIXME: use this line when the fantom RPC bug has been fixed
  // const ids = createdEvents.map((event) => event.args!.projectID!.toNumber());
  const ids = createdEvents.map((event) => parseInt(event.topics[1], 16));

  const fullIds = ids.map(
    (id) => `${chainID}:${addresses.projectRegistry}:${id}`
  );

  // FIXME: use this line when the fantom RPC bug has been fixed
  // const hexIDs = createdEvents.map((event) =>
  //   event.args!.projectID!.toHexString()
  // );
  const hexIDs = createdEvents.map((event) => event.topics[1]);

  // FIXME: use this after fantom bug is fixed
  // const updatedFilter = contract.filters.MetadataUpdated(hexIDs);
  // const updatedEvents = await contract.queryFilter(updatedFilter);

  // FIXME: remove when fantom bug is fixed
  const updatedEventSig = ethers.utils.id(
    "MetadataUpdated(uint256,(uint256,string))"
  );
  const updatedFilter = {
    address: addresses.projectRegistry,
    fromBlock: "0x00",
    toBlock: "latest",
    topics: [updatedEventSig, hexIDs],
  };

  // FIXME: remove when the fantom RPC bug has been fixed
  if (chainID === 250 || chainID === 4002) {
    updatedFilter.address = undefined;
  }

  let updatedEvents = await appProvider!.getLogs(updatedFilter);

  // FIXME: remove when the fantom RPC bug has been fixed
  updatedEvents = updatedEvents.filter(
    (e) => e.address === addresses.projectRegistry
  );

  return {
    createdEvents,
    updatedEvents,
    ids: fullIds,
  };
};

export const extractProjectEvents = (
  createdEvents: ethers.providers.Log[],
  updatedEvents: ethers.providers.Log[],
  chainID: number
) => {
  const chainAddresses = addressesByChainID(chainID);
  const eventList: { [key: string]: ProjectEvents } = {};
  const projectEventsMap: ProjectEventsMap = {};

  createdEvents.forEach((createEvent) => {
    // FIXME: use this line when the fantom RPC bug has been fixed (update line to work with new project id format)
    // const id = createEvent.args!.projectID!;
    const id = `${chainID}:${chainAddresses.projectRegistry}:${parseInt(
      createEvent.topics[1],
      16
    )}`;

    // eslint-disable-next-line no-param-reassign
    eventList[id] = {
      createdAtBlock: createEvent.blockNumber,
      updatedAtBlock: undefined,
    };

    projectEventsMap[id] = {
      ...eventList[id],
    };
  });

  updatedEvents.forEach((updateEvent) => {
    // FIXME: use this line when the fantom RPC bug has been fixed (update line to work with new project id format)
    // const id = BigNumber.from(updateEvent.args!.projectID!).toNumber();
    const id = `${chainID}:${chainAddresses.projectRegistry}:${parseInt(
      updateEvent.topics[1],
      16
    )}`;
    if (eventList[id] !== undefined) {
      // eslint-disable-next-line no-param-reassign
      eventList[id].updatedAtBlock = updateEvent.blockNumber;
    }
    projectEventsMap[id] = {
      ...eventList[id],
    };
  });

  return projectEventsMap;
};

export const loadProjects =
  (chainID: number, withMetaData?: boolean) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const { account } = state.web3;
    const project = await fetchProjectCreatedUpdatedEvents(chainID, account!);

    if (project.ids.length === 0) {
      // No projects found for this address on this chain
      // This is not necessarily an error now that we fetch on all chains
      dispatch(projectsLoaded({}));
      return;
    }

    const projectEventsMap = extractProjectEvents(
      project.createdEvents,
      project.updatedEvents,
      chainID
    );

    if (withMetaData) {
      Object.keys(projectEventsMap).forEach(async (id) => {
        dispatch<any>(fetchGrantData(id));
      });
    }
    dispatch(projectsLoaded(projectEventsMap));
  };

export const loadAllChainsProjects =
  (withMetaData?: boolean) => async (dispatch: Dispatch) => {
    dispatch(projectsLoading());
    const { web3Provider } = global;
    web3Provider?.chains?.forEach((chainID) => {
      dispatch<any>(loadProjects(chainID.id, withMetaData));
    });
  };

export const fetchApplicationStatusesFromContract =
  (
    roundAddresses: string[],
    projectID: string,
    projectApplicationID: string,
    chainId: number
  ) =>
  async (dispatch: Dispatch) => {
    roundAddresses.forEach(async (roundAddress: string) => {
      const appProvider = getProviderByChainId(chainId);
      const contract = new ethers.Contract(
        roundAddress,
        RoundImplementationABI,
        appProvider
      );
      try {
        const result = await contract.projectsMetaPtr();
        const pinataClient = new PinataClient();
        const data = await pinataClient.fetchJson(result.pointer);
        const projectApplication = data.find((app: any) => {
          if (app.id === undefined) {
            return false;
          }

          // appId is in the form "projectApplicationID-roundAddress"
          const parts = app.id.split("-");
          if (parts[0] === projectApplicationID) {
            return true;
          }
          return false;
        });
        if (projectApplication !== undefined) {
          dispatch({
            type: "PROJECT_APPLICATION_UPDATED",
            projectID,
            roundID: roundAddress,
            status: projectApplication.status,
          });
        }
      } catch (error: any) {
        datadogRum.addError(error, { roundAddress });
        datadogLogs.logger.error("getApplicationStatusFromContract() error", {
          roundAddress,
          error,
        });
        dispatch({
          type: PROJECT_APPLICATIONS_ERROR,
          projectID,
          error: error.message,
        });
      }
    });
  };

export const fetchProjectApplications =
  (projectID: string, projectChainId: number, reactEnv: any /* ProcessEnv */) =>
  async (dispatch: Dispatch) => {
    dispatch({
      type: PROJECT_APPLICATIONS_LOADING,
      projectID,
    });

    const { web3Provider } = global;

    await web3Provider?.chains?.forEach(async (chain) => {
      const addresses = addressesByChainID(projectChainId);
      const projectApplicationID = generateUniqueRoundApplicationID(
        projectChainId,
        projectID,
        addresses.projectRegistry
      );

      try {
        const response: any = await graphqlFetch(
          `query roundProjects($projectID: String) {
            roundProjects(where: { project: $projectID }) {
              status
              round {
                id
              }
            }
          }
          `,
          chain.id,
          { projectID: projectApplicationID },
          reactEnv
        );

        const applications = response.data.roundProjects.map((rp: any) => ({
          status: rp.status,
          roundID: rp.round.id,
          chainId: chain.id,
        }));

        if (applications.length === 0) {
          return;
        }

        dispatch({
          type: PROJECT_APPLICATIONS_LOADED,
          projectID,
          applications,
        });

        // Update each application with the status from the contract
        // FIXME: This part can be removed when we are sure that the
        // aplication status returned from the graph is up to date.
        // eslint-disable-next-line
        const roundAddresses = applications.map(
          (app: Application) => app.roundID
        );
        dispatch<any>(
          fetchApplicationStatusesFromContract(
            roundAddresses,
            projectID,
            projectApplicationID,
            chain.id
          )
        );
      } catch (error: any) {
        datadogRum.addError(error, { projectID });
        dispatch({
          type: PROJECT_APPLICATIONS_ERROR,
          projectID,
          error: error.message,
        });
      }
    });
  };

export const unloadProjects = () => projectsUnload();
