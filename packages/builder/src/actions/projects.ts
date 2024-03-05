import { datadogRum } from "@datadog/browser-rum";
import { ChainId } from "common";
import { getConfig } from "common/src/config";
import {
  ApplicationStatus,
  DataLayer,
  ProjectApplicationWithRound,
} from "data-layer";
import { Dispatch } from "redux";
import { global } from "../global";
import { RootState } from "../reducers";
import { ProjectStats } from "../reducers/projects";
import { transformAndDispatchProject } from "./grantsMetadata";
import { addAlert } from "./ui";

export const PROJECTS_LOADING = "PROJECTS_LOADING";

interface ProjectsLoadingAction {
  payload: number[];
  type: typeof PROJECTS_LOADING;
}

export const PROJECTS_LOADED = "PROJECTS_LOADED";

interface ProjectsLoadedAction {
  type: typeof PROJECTS_LOADED;
  payload: {
    chainIDs: ChainId[];
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
  applications: ProjectApplicationWithRound[];
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
export const projectsLoading = (
  chainIDs: ChainId[]
): ProjectsLoadingAction => ({
  type: PROJECTS_LOADING,
  payload: chainIDs,
});

export const projectsLoaded = (chainIDs: ChainId[]): ProjectsLoadedAction => ({
  type: PROJECTS_LOADED,
  payload: {
    chainIDs,
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
  (chainIDs: ChainId[], dataLayer: DataLayer, withMetaData?: boolean) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const { account } = state.web3;

      const projects = await dataLayer.getProjectsByAddress({
        address: account!.toLowerCase(),
        alloVersion: getConfig().allo.version,
        chainIds: chainIDs.map((id) => id.valueOf()),
      });

      if (projects && withMetaData) {
        projects.forEach((project) => {
          dispatch<any>(transformAndDispatchProject(project.id, project));
        });
      }

      dispatch(projectsLoaded(chainIDs));
    } catch (error: any) {
      datadogRum.addError(error, { chainIDs });

      dispatch(projectsLoaded(chainIDs));

      if (
        chainIDs.includes(424) &&
        error?.reason === "ENS name not configured"
      ) {
        return;
      }

      dispatch(
        addAlert(
          "error",
          `Failed to load projects from ${chainIDs}`,
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
    const chainIds = web3Provider?.chains?.map((chain) => chain.id as ChainId);
    if (chainIds) {
      dispatch(projectsLoading(chainIds));
      dispatch<any>(loadProjects(chainIds, dataLayer, withMetaData));
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
  (projectId: string, dataLayer: DataLayer) => async (dispatch: Dispatch) => {
    dispatch({
      type: PROJECT_APPLICATIONS_LOADING,
      projectID: projectId,
    });

    try {
      const { web3Provider } = global;
      if (!web3Provider?.chains) {
        return;
      }

      const chainIds = web3Provider.chains.map((chain) => chain.id);

      const legacyProjectId = await dataLayer.getLegacyProjectId({
        projectId,
      });

      const projectIds = [projectId];
      if (legacyProjectId) {
        projectIds.push(legacyProjectId);
      }

      const applications = await dataLayer.getApplicationsByProjectIds({
        projectIds,
        chainIds,
      });

      const stats: ProjectStats[] = [];

      // for each application, get the round data
      for (const application of applications) {
        const singleStats: ProjectStats = {
          roundId: application.roundId,
          fundingReceived: application.totalAmountDonatedInUsd,
          uniqueContributors: application.uniqueDonorsCount,
          avgContribution:
            application.uniqueDonorsCount === 0
              ? 0
              : application.totalAmountDonatedInUsd /
                application.uniqueDonorsCount,
          totalContributions: application.totalDonationsCount,
          success: true,
        };

        stats.push(singleStats);
      }

      dispatch({
        type: PROJECT_APPLICATIONS_LOADED,
        projectID: projectId,
        applications,
      });

      dispatch({
        type: PROJECT_STATS_LOADED,
        projectID: projectId,
        stats,
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

export const unloadProjects = () => projectsUnload();
