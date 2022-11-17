import { datadogRum } from "@datadog/browser-rum";
import { BigNumber, Contract, ethers } from "ethers";
import { Dispatch } from "redux";
// import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { addressesByChainID } from "../contracts/deployments";
import { global } from "../global";
import { RootState } from "../reducers";
import { AppStatus } from "../reducers/projects";
import PinataClient from "../services/pinata";
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
  | ProjectsErrorAction
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

const projectError = (error: string) => ({
  type: PROJECTS_ERROR,
  error,
});

const projectsUnload = () => ({
  type: PROJECTS_UNLOADED,
});

const fetchProjectCreatedEvents = async (chainID: number, account: string) => {
  const addresses = addressesByChainID(chainID!);
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
  let createdEvents = await global.web3Provider!.getLogs(createdFilter);

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

  let updatedEvents = await global.web3Provider!.getLogs(updatedFilter);
  console.log(updatedEventSig);
  console.log(updatedFilter);
  // FIXME: remove when the fantom RPC bug has been fixed
  updatedEvents = updatedEvents.filter(
    (e) => e.address === addresses.projectRegistry
  );

  return {
    createdEvents,
    updatedEvents,
    ids,
  };
};

export const loadProjects =
  (withMetaData?: boolean) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(projectsLoading());

    const state = getState();
    const { chainID, account } = state.web3;

    try {
      const { createdEvents, updatedEvents, ids } =
        await fetchProjectCreatedEvents(chainID!, account!);

      if (createdEvents.length === 0) {
        dispatch(projectsLoaded({}));
        return;
      }

      const events: ProjectEventsMap = {};

      createdEvents.forEach((createEvent) => {
        // FIXME: use this line when the fantom RPC bug has been fixed
        // const id = createEvent.args!.projectID!;
        const id = parseInt(createEvent.topics[1], 16);
        events[id] = {
          createdAtBlock: createEvent.blockNumber,
          updatedAtBlock: undefined,
        };
      });

      updatedEvents.forEach((updateEvent) => {
        // FIXME: use this line when the fantom RPC bug has been fixed
        // const id = BigNumber.from(updateEvent.args!.projectID!).toNumber();
        const id = BigNumber.from(updateEvent.topics[1]).toNumber();
        const event = events[id];
        if (event !== undefined) {
          event.updatedAtBlock = updateEvent.blockNumber;
        }
      });

      if (withMetaData) {
        ids.map((id) => dispatch<any>(fetchGrantData(id)));
      }

      dispatch(projectsLoaded(events));
    } catch (error) {
      dispatch(projectError("Cannot load projects"));
    }
  };

const updateApplicationStatusFromContract = async (
  applications: any[],
  projectsMetaPtr: any,
  filterByStatus?: string
) => {
  // Handle scenario where operator hasn't review any projects in the round
  if (!projectsMetaPtr)
    return filterByStatus
      ? applications.filter(
          (application) => application.status === filterByStatus
        )
      : applications;

  const ipfsClient = new PinataClient();
  const applicationsFromContract = await ipfsClient.fetchJson(
    projectsMetaPtr.pointer
  );
  console.log("applicationsFromContract", applicationsFromContract);

  // Iterate over all applications indexed by graph
  applications.map((application) => {
    try {
      console.log("application before", application);
      // fetch matching application index from contract
      const index = applicationsFromContract.findIndex(
        (applicationFromContract: any) =>
          application.id === applicationFromContract.id
      );
      console.log("index", index);
      // update status of application from contract / default to pending
      // eslint-disable-next-line
      application.status =
        index >= 0 ? applicationsFromContract[index].status : "PENDING";
      console.log("application after", application);
    } catch {
      // eslint-disable-next-line
      application.status = "PENDING";
    }
    return application;
  });

  if (filterByStatus) {
    return applications.filter(
      (application) => application.status === filterByStatus
    );
  }

  return applications;
};

export const getApplicationsByRoundId =
  // eslint-disable-next-line
  async (roundId: string, chainId: any) => {
    try {
      console.log("fetching applications for round", roundId);
      // query the subgraph for all rounds by the given account in the given program
      const res = await graphqlFetch(
        `
          query GetApplicationsByRoundId($roundId: String!, $status: String) {
            roundProjects(where: {
              round: $roundId
            }) {
              id
              metaPtr {
                protocol
                pointer
              }
              status
              round {
                projectsMetaPtr {
                  protocol
                  pointer
                }
              }
            }
          }
        `,
        chainId,
        { roundId }
      );

      const grantApplications: any[] = [];

      const ipfsClient = new PinataClient();
      for (const project of res.data.roundProjects) {
        // eslint-disable-next-line
        const metadata = await ipfsClient.fetchJson(project.metaPtr.pointer);
        console.log("metadata", metadata);

        // const signature = metadata?.signature;
        const application = metadata.application
          ? metadata.application
          : metadata;

        grantApplications.push({
          ...application,
          status: project.status,
          id: project.id,
          projectsMetaPtr: project.round.projectsMetaPtr,
        });

        console.log("grantApplications******", grantApplications);

        updateApplicationStatusFromContract(
          grantApplications,
          res.data.roundProjects[0].round.projectsMetaPtr
        );
      }

      return grantApplications;
    } catch (error) {
      datadogRum.addError(error, { roundId });
      console.error("getApplicationsByRoundId() error", error);
    }
  };

export const getRoundProjectsApplied =
  (projectID: string, chainId: ChainId) => async (dispatch: Dispatch) => {
    dispatch({
      type: PROJECT_APPLICATIONS_LOADING,
      projectID,
    });

    try {
      console.log("fetching graphql project application data");
      const applicationsFound: any = await graphqlFetch(
        `query roundProjects($projectID: String) {
          roundProjects(where: { project: $projectID }) {
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

      const applications = applicationsFound.data.roundProjects;
      console.log(
        "applications found for project",
        applicationsFound.data.roundProjects
      );
      // update each application with the status from the contract
      // eslint-disable-next-line
      applications.map((application: any) => {
        // fetch the round metadata
        getApplicationsByRoundId(application.round.id, chainId);
      });

      // todo: update the application status from the contract using same action
      dispatch({
        type: PROJECT_APPLICATIONS_LOADED,
        projectID,
        applications: applicationsFound.data.roundProjects,
      });
    } catch (error: any) {
      datadogRum.addError(error, { projectID });
      dispatch({
        type: PROJECT_APPLICATIONS_ERROR,
        projectID,
        error: error.message,
      });
    }
  };

export const checkGrantApplicationStatus = async (
  id: any,
  projectsMetaPtr: any
): Promise<AppStatus> => {
  let reviewedApplications: any[] = [];

  const ipfsClient = new PinataClient();
  if (projectsMetaPtr) {
    reviewedApplications = await ipfsClient.fetchJson(projectsMetaPtr.pointer);
  }

  const obj = reviewedApplications.find((o) => o.id === id);

  return obj ? (obj.status as AppStatus) : "PENDING";
};

// fetchApplicationData() is called when a user clicks on a project
// to view the project details page
// eslint-disable-next-line
const fetchApplicationData = async (
  res: any,
  id: string,
  projectRegistry: Contract
): Promise<any[]> =>
  Promise.all(
    res.data.roundProjects.map(async (project: any): Promise<any> => {
      const ipfsClient = new PinataClient();
      const metadata = await ipfsClient.fetchJson(project.metaPtr.pointer);

      const application = metadata.application
        ? metadata.application
        : metadata;

      let { status } = project;

      if (id) {
        status = await checkGrantApplicationStatus(
          project.id,
          project.round.projectsMetaPtr
        );
      }

      const projectMetadata = application.project;
      const projectRegistryId = projectMetadata.id;
      const projectOwners = await projectRegistry.getProjectOwners(
        projectRegistryId
      );
      const grantApplicationProjectMetadata: any = {
        ...projectMetadata,
        owners: projectOwners.map((address: string) => ({ address })),
      };

      return {
        ...application,
        status,
        id: project.id,
        project: grantApplicationProjectMetadata,
        projectsMetaPtr: project.round.projectsMetaPtr,
      } as any;
    })
  );

export const unloadProjects = () => projectsUnload();
