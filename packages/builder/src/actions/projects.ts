import { datadogRum } from "@datadog/browser-rum";
import { Client as AlloClient } from "allo-indexer-client";
import { ChainId, ROUND_PAYOUT_MERKLE, RoundPayoutType } from "common";
import { getConfig } from "common/src/config";
import {
  ApplicationStatus,
  DataLayer,
  ProjectApplication,
  ProjectEventsMap,
} from "data-layer";
import { utils } from "ethers";
import { Dispatch } from "redux";
import { addressesByChainID } from "../contracts/deployments";
import { global } from "../global";
import { RootState } from "../reducers";
import { ProjectStats } from "../reducers/projects";
import { getEnabledChainsAndProviders } from "../utils/chains";
import { graphqlFetch } from "../utils/graphql";
import generateUniqueRoundApplicationID from "../utils/roundApplication";
import { getV1HashedProjectId } from "../utils/utils";
import { fetchGrantData } from "./grantsMetadata";
import { addAlert } from "./ui";

const { chains } = getEnabledChainsAndProviders();
export const PROJECTS_LOADING = "PROJECTS_LOADING";

export type SubgraphApplication = {
  round: { id: string };
  status: ApplicationStatus;
  inReview: boolean;
  chainId: ChainId;
  metaPtr?: {
    protocol: string;
    pointer: string;
  };
};

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
  applications: ProjectApplication[];
}

export const PROJECT_APPLICATION_UPDATED = "PROJECT_APPLICATION_UPDATED";

interface ProjectApplicationUpdatedAction {
  type: typeof PROJECT_APPLICATION_UPDATED;
  projectID: string;
  roundID: string;
  status: ApplicationStatus;
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

export const PROJECT_ANCHORS_LOADED = "PROJECT_ANCHORS_LOADED";

interface ProjectAnchorsLoadedAction {
  type: typeof PROJECT_ANCHORS_LOADED;
  payload: {
    projectID: string;
    anchor: string;
  };
}

/** Actions */

/** Project Action Types */
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
  | ProjectStatsLoadedAction
  | ProjectAnchorsLoadedAction;

/** Action Creators */
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

export const projectOwnersLoaded = (projectID: string, owners: string[]) => ({
  type: PROJECT_OWNERS_LOADED,
  payload: {
    projectID,
    owners,
  },
});

export const projectAnchorsLoaded = (projectID: string, anchor: string) => ({
  type: PROJECT_ANCHORS_LOADED,
  payload: {
    projectID,
    anchor,
  },
});

/**
 * Load projects for a given chain
 *
 * @remarks
 *
 * This function is a thunk action creator. It loads projects for a given chain and dispatches the
 * appropriate actions to the store.
 *
 * @param chainID
 * @param dataLayer
 * @param withMetaData
 *
 * @returns All projects for a given chain
 */
export const loadProjects =
  (chainID: ChainId, dataLayer: DataLayer, withMetaData?: boolean) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const { account } = state.web3;

      const projectEventsMap = await dataLayer.getProjectsByAddress({
        address: account!.toLowerCase(),
        alloVersion: getConfig().allo.version,
        chainId: chainID.valueOf(),
      });

      if (!projectEventsMap) {
        dispatch(projectsLoaded(chainID, {}));
        return;
      }

      if (withMetaData) {
        Object.keys(projectEventsMap).forEach(async (id) => {
          dispatch<any>(fetchGrantData(id, dataLayer));
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

/**
 * Load all projects for all networks
 *
 * @remarks
 * This function is a thunk action creator. It loads all projects for all supported networks and dispatches the
 * appropriate actions to the store.
 *
 * Calls `loadProjects()` for each network or chainID supported.
 *
 * {@link loadProjects}
 *
 * @param dataLayer
 * @param withMetaData
 *
 * @returns All projects for all supported networks
 */
export const loadAllChainsProjects =
  (dataLayer: DataLayer, withMetaData?: boolean) =>
  async (dispatch: Dispatch) => {
    const { web3Provider } = global;
    web3Provider?.chains?.forEach((chainID: { id: number }) => {
      dispatch(projectsLoading(chainID.id));
      dispatch<any>(loadProjects(chainID.id, dataLayer, withMetaData));
    });
  };

/**
 * Load project applications for a given round
 *
 * @remarks
 *
 * This returns whether the project has applied to a given round.
 *
 * @param roundID
 * @param roundChainId
 *
 * @returns boolean
 */
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

/**
 * Load project applications for a given project on a given chain
 *
 * @remarks
 *
 * This loads project applications for a given project and network and dispatches the
 * appropriate actions to the store.
 *
 * @param projectId
 * @param dataLayer
 *
 * @returns All applications for a given project
 */
export const fetchProjectApplications =
  (projectId: string, chainId: ChainId, dataLayer: DataLayer) =>
  async (dispatch: Dispatch) => {
    const config = getConfig();

    dispatch({
      type: PROJECT_APPLICATIONS_LOADING,
      projectID: projectId,
    });

    try {
      const { web3Provider } = global;
      if (!web3Provider?.chains) {
        return;
      }

      const id =
        config.allo.version === "allo-v1"
          ? getV1HashedProjectId(
              `${chainId}:${
                addressesByChainID(chainId).projectRegistry
              }:${projectId}`
            )
          : projectId;

      const chainIds = web3Provider.chains.map((chain) => chain.id);
      const applications = await dataLayer.getApplicationsByProjectId({
        projectId: id,
        chainIds,
      });

      applications?.forEach(async (application, index) => {
        const programName = await dataLayer.getProgramName({
          projectId: application.round.roundMetadata.programContractAddress,
        });

        applications[index].round.name = programName || "";
      });

      dispatch({
        type: PROJECT_APPLICATIONS_LOADED,
        projectID: projectId,
        applications,
      });
    } catch (error: any) {
      console.error(
        "failed fetchProjectApplications for",
        "Project Id",
        projectId,
        error
      );
      datadogRum.addError(error, { projectId });
    }
  };

/**
 * Load project stats for a given project and network
 *
 * @param projectID
 * @param projectRegistryAddress
 * @param projectChainId
 * @param rounds
 *
 * @returns
 */
export const loadProjectStats =
  (
    projectID: string,
    projectRegistryAddress: string,
    projectChainId: string,
    rounds: Array<{
      roundId: string;
      chainId: ChainId;
      roundType: RoundPayoutType;
    }>
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
        process.env.REACT_APP_INDEXER_V2_API_URL ?? "",
        round.chainId
      );

      const applications = await client.getRoundApplications(
        utils.getAddress(round.roundId.toLowerCase())
      );

      const project = applications.find(
        (app) =>
          app.projectId === uniqueProjectID &&
          app.status === "APPROVED" &&
          round.roundType === ROUND_PAYOUT_MERKLE
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
