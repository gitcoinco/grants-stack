import { datadogRum } from "@datadog/browser-rum";
import { Client as AlloClient } from "allo-indexer-client";
import { ChainId, convertStatusToText } from "common";
import { ethers, utils } from "ethers";
import { Dispatch } from "redux";
import { addressesByChainID } from "../contracts/deployments";
import { global } from "../global";
import { RootState } from "../reducers";
import { AppStatus, Application, ProjectStats } from "../reducers/projects";
import { ProjectEvents, ProjectEventsMap } from "../types";
import { graphqlFetch } from "../utils/graphql";
import { fetchProjectOwners } from "../utils/projects";
import generateUniqueRoundApplicationID from "../utils/roundApplication";
import { getProjectURIComponents, getProviderByChainId } from "../utils/utils";
import { chains } from "../utils/wagmi";
import { fetchGrantData } from "./grantsMetadata";
import { addAlert } from "./ui";

export const PROJECTS_LOADING = "PROJECTS_LOADING";

interface ProjectsLoadingAction {
  payload: number;
  type: typeof PROJECTS_LOADING;
}

export const PROJECTS_LOADED = "PROJECTS_LOADED";

interface ProjectsLoadedAction {
  type: typeof PROJECTS_LOADED;
  payload: {
    chainID: ChainId;
    events: ProjectEventsMap;
  };
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

export const PROJECT_OWNERS_LOADED = "PROJECT_OWNERS_LOADED";

interface ProjectOwnersLoadedAction {
  type: typeof PROJECT_OWNERS_LOADED;
  payload: {
    projectID: string;
    owners: string[];
  };
}

export const PROJECT_STATS_LOADING = "PROJECT_STATS_LOADING";

interface ProjectStatsLoadingAction {
  type: typeof PROJECT_STATS_LOADING;
  projectID: string;
}

export const PROJECT_STATS_LOADED = "PROJECT_STATS_LOADED";

interface ProjectStatsLoadedAction {
  type: typeof PROJECT_STATS_LOADED;
  projectID: string;
  stats: ProjectStats[];
}

export type ProjectsActions =
  | ProjectsLoadingAction
  | ProjectsLoadedAction
  | ProjectsErrorAction
  | ProjectsUnloadedAction
  | ProjectApplicationsLoadingAction
  | ProjectApplicationsLoadedAction
  | ProjectApplicationsErrorAction
  | ProjectApplicationUpdatedAction
  | ProjectOwnersLoadedAction
  | ProjectStatsLoadingAction
  | ProjectStatsLoadedAction;

export const projectsLoading = (chainID: ChainId): ProjectsLoadingAction => ({
  type: PROJECTS_LOADING,
  payload: chainID,
});

export const projectsLoaded = (
  chainID: ChainId,
  events: ProjectEventsMap
): ProjectsLoadedAction => ({
  type: PROJECTS_LOADED,
  payload: {
    chainID,
    events,
  },
});

const projectsUnload = () => ({
  type: PROJECTS_UNLOADED,
});

const fetchProjectCreatedUpdatedEvents = async (
  chainID: ChainId,
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
  chainId: ChainId
) => {
  const chainAddresses = addressesByChainID(chainId);
  const eventList: { [key: string]: ProjectEvents } = {};
  const projectEventsMap: ProjectEventsMap = {};

  createdEvents.forEach((createEvent) => {
    // FIXME: use this line when the fantom RPC bug has been fixed (update line to work with new project id format)
    // const id = createEvent.args!.projectID!;
    const id = `${chainId}:${chainAddresses.projectRegistry}:${parseInt(
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
    const id = `${chainId}:${chainAddresses.projectRegistry}:${parseInt(
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

export const projectOwnersLoaded = (projectID: string, owners: string[]) => ({
  type: PROJECT_OWNERS_LOADED,
  payload: {
    projectID,
    owners,
  },
});

export const loadProjectOwners =
  (projectID: string) => async (dispatch: Dispatch) => {
    const { chainId, id } = getProjectURIComponents(projectID);

    const owners = await fetchProjectOwners(Number(chainId), id);

    dispatch(projectOwnersLoaded(projectID, owners));
  };

export const loadProjects =
  (chainID: ChainId, withMetaData?: boolean) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const { account } = state.web3;
      const project = await fetchProjectCreatedUpdatedEvents(chainID, account!);

      if (project.ids.length === 0) {
        // No projects found for this address on this chain
        // This is not necessarily an error now that we fetch on all chains
        dispatch(projectsLoaded(chainID, {}));
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

      dispatch(projectsLoaded(chainID, projectEventsMap));
    } catch (error) {
      const chainName = chains.find((c) => c.id === chainID)?.name;
      if (chainName === "Hardhat") {
        dispatch(projectsLoaded(chainID, {}));
        return;
      }
      datadogRum.addError(error, { chainID });
      console.error(chainName, chainID, error);

      dispatch(projectsLoaded(chainID, {}));

      /* TODO: Once ENS is deployed on PGN Mainnet and testnet, undo this */
      // @ts-expect-error
      if (chainID === 424 && error?.reason === "ENS name not configured") {
        return;
      }

      dispatch(
        addAlert(
          "error",
          `Failed to load projects from ${chainName}`,
          "Please try refreshing the page."
        )
      );
    }
  };

export const loadAllChainsProjects =
  (withMetaData?: boolean) => async (dispatch: Dispatch) => {
    const { web3Provider } = global;
    web3Provider?.chains?.forEach((chainID: { id: number }) => {
      dispatch(projectsLoading(chainID.id));
      dispatch<any>(loadProjects(chainID.id, withMetaData));
    });
  };

export const fetchProjectApplicationInRound = async (
  applicationId: string,
  roundID: string,
  roundChainId: ChainId
): Promise<any> => {
  const splitApplicationId = applicationId.split(":");
  const projectChainId = Number(splitApplicationId[0]);
  const projectRegistryAddress = splitApplicationId[1];
  const projectNumber = splitApplicationId[2];

  const projectApplicationID = generateUniqueRoundApplicationID(
    projectChainId,
    projectNumber,
    projectRegistryAddress
  ).toLowerCase();

  const Id = roundID.toLowerCase();

  try {
    const response: any = await graphqlFetch(
      `query projectApplicationInRound($projectApplicationID: String, $Id: String) {
          roundApplications(
            where: {
              project: $projectApplicationID,
              round: $Id
            }
          ) {
            status
          }
        }
      `,
      roundChainId,
      {
        projectApplicationID,
        Id,
      }
    );

    if (response.errors) {
      throw response.errors;
    }

    return {
      hasProjectAppliedToRound: response.data.roundApplications
        ? response.data.roundApplications.length > 0
        : false,
    };
  } catch (error: any) {
    datadogRum.addError(error, { projectApplicationID, roundID });
    console.error(error);

    return {
      hasProjectAppliedToRound: false,
    };
  }
};

export const fetchProjectApplications =
  (projectID: string, projectChainId: ChainId) =>
  async (dispatch: Dispatch) => {
    dispatch({
      type: PROJECT_APPLICATIONS_LOADING,
      projectID,
    });

    const { web3Provider } = global;

    if (!web3Provider?.chains) {
      return;
    }

    const apps = await Promise.all(
      web3Provider.chains.map(async (chain: { id: number }) => {
        try {
          const addresses = addressesByChainID(projectChainId);
          const projectApplicationID = generateUniqueRoundApplicationID(
            projectChainId,
            projectID,
            addresses.projectRegistry!
          );

          const response: any = await graphqlFetch(
            `query roundApplications($projectApplicationID: String) {
            roundApplications(where: { project: $projectApplicationID }) {
              status
              round {
                id
              }
              metaPtr {
                pointer
                protocol
              }
            }
          }
          `,
            chain.id,
            {
              projectApplicationID,
            }
          );

          if (response.errors) {
            throw response.errors;
          }

          const applications = response.data.roundApplications.map(
            (application: any) => ({
              status: convertStatusToText(application.status),
              roundID: application.round.id,
              chainId: chain.id,
              metaPtr: application.metaPtr,
            })
          );

          if (applications.length === 0) {
            return [];
          }

          dispatch({
            type: PROJECT_APPLICATIONS_LOADED,
            projectID,
            applications,
          });

          return applications;
        } catch (error: any) {
          console.error(
            "failed fetchProjectApplications for",
            "Project Id",
            projectID,
            "in Chain Id",
            chain.id,
            error
          );
          datadogRum.addError(error, { projectID });

          return [];
        }
      })
    );

    dispatch({
      type: PROJECT_APPLICATIONS_LOADED,
      projectID,
      applications: apps.flat(),
    });
  };

export const loadProjectStats =
  (
    projectID: string,
    projectRegistryAddress: string,
    projectChainId: string,
    rounds: Array<{ roundId: string; chainId: ChainId }>
  ) =>
  async (dispatch: Dispatch) => {
    const uniqueProjectID = generateUniqueRoundApplicationID(
      Number(projectChainId),
      projectID,
      projectRegistryAddress
    );

    dispatch({
      type: PROJECT_STATS_LOADING,
      projectID,
    });
    const boundFetch = fetch.bind(window);

    const stats: ProjectStats[] = [];

    const updateStats = async (projectRoundData: any, roundId: string) => {
      const singleStats: ProjectStats = {
        roundId,
        ...projectRoundData,
      };

      stats.push(singleStats);
    };

    const loadingErrorUpdate = async (roundId: string) => {
      await updateStats(
        {
          fundingReceived: -1,
          uniqueContributors: -1,
          avgContribution: -1,
          totalContributions: -1,
          success: false,
        },
        roundId
      );
    };

    for await (const round of rounds) {
      // NOTE: Consider finding a way for singleton Client to be used
      const client = new AlloClient(
        boundFetch,
        process.env.REACT_APP_ALLO_API_URL ?? "",
        round.chainId
      );

      const applications = await client.getRoundApplications(
        utils.getAddress(round.roundId.toLowerCase())
      );

      const project = applications.find(
        (app) => app.projectId === uniqueProjectID && app.status === "APPROVED"
      );

      if (project) {
        await updateStats(
          {
            fundingReceived: project.amountUSD,
            uniqueContributors: project.uniqueContributors,
            avgContribution:
              project.uniqueContributors === 0
                ? 0
                : project.amountUSD / project.uniqueContributors,
            totalContributions: project.votes,
            success: true,
          },
          round.roundId
        );
      } else {
        await loadingErrorUpdate(round.roundId);
      }
    }

    dispatch({
      type: PROJECT_STATS_LOADED,
      projectID,
      stats,
    });
  };

export const unloadProjects = () => projectsUnload();
