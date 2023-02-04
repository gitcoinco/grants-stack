import {
  ProjectsActions,
  PROJECTS_ERROR,
  PROJECTS_LOADED,
  PROJECTS_LOADING,
  PROJECTS_UNLOADED,
  PROJECT_APPLICATIONS_ERROR,
  PROJECT_APPLICATIONS_LOADED,
  PROJECT_APPLICATIONS_LOADING,
  PROJECT_APPLICATION_UPDATED,
  PROJECT_OWNERS_LOADED,
  PROJECT_STATS_LOADED,
  PROJECT_STATS_LOADING,
} from "../actions/projects";
import { ProjectEventsMap } from "../types";

export enum Status {
  Undefined = 0,
  Loading,
  Loaded,
  Error,
}

export type AppStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "APPEAL"
  | "FRAUD";

export type Application = {
  roundID: string;
  status: AppStatus;
  chainId: number;
};

export type ProjectOwners = { [projectID: string]: string[] };

export interface ProjectsState {
  status: Status;
  loadingChains: number[];
  error: string | undefined;
  ids: string[];
  events: ProjectEventsMap;
  owners: ProjectOwners;
  applications: {
    [projectID: string]: Application[];
  };
  stats: {
    [projectID: string]: ProjectStats[];
  };
}

export const initialState: ProjectsState = {
  status: Status.Undefined,
  loadingChains: [],
  error: undefined,
  ids: [],
  owners: {},
  events: {},
  applications: {},
  stats: {},
};

export type ProjectStats = {
  roundId: string;
  fundingReceived: number;
  uniqueContributors: number;
  avgContribution: number;
  totalContributions: number;
  success: boolean;
};

export const projectsReducer = (
  state: ProjectsState = initialState,
  action: ProjectsActions
): ProjectsState => {
  switch (action.type) {
    case PROJECTS_LOADING: {
      return {
        ...state,
        status: Status.Loading,
        loadingChains: [...state.loadingChains, action.payload],
        ids: [],
      };
    }

    case PROJECT_OWNERS_LOADED: {
      return {
        ...state,
        owners: {
          ...state.owners,
          [action.payload.projectID]: action.payload.owners,
        },
      };
    }

    case PROJECTS_LOADED: {
      const { chainID, events } = action.payload;
      const ids = Object.keys(events);
      const loadingChains = state.loadingChains.filter((id) => id !== chainID);

      return {
        ...state,
        status: loadingChains.length === 0 ? Status.Loaded : state.status,
        ids: [...state.ids, ...ids],
        events: { ...state.events, ...events },
        loadingChains,
      };
    }

    case PROJECTS_ERROR: {
      return {
        ...state,
        status: Status.Error,
        error: action.error,
      };
    }

    case PROJECTS_UNLOADED: {
      return {
        ...state,
        status: Status.Undefined,
        ids: [],
        events: {},
      };
    }

    case PROJECT_APPLICATIONS_LOADING: {
      // Remove the project applications key
      const { [action.projectID]: projectApplications, ...applications } =
        state.applications;

      return {
        ...state,
        applications,
      };
    }

    case PROJECT_APPLICATIONS_LOADED: {
      return {
        ...state,
        applications: {
          ...state.applications,
          [action.projectID]: action.applications,
        },
        error: undefined,
      };
    }

    case PROJECT_APPLICATION_UPDATED: {
      const projectApplications = state.applications[action.projectID] || [];
      const index = projectApplications.findIndex(
        (app: Application) => app.roundID === action.roundID
      );

      if (index < 0) {
        return state;
      }

      const updatedApplication = {
        ...projectApplications[index],
        status: action.status,
      };

      return {
        ...state,
        applications: {
          ...state.applications,
          [action.projectID]: [
            ...projectApplications.slice(0, index),
            updatedApplication,
            ...projectApplications.slice(index + 1),
          ],
        },
        error: undefined,
      };
    }

    case PROJECT_STATS_LOADING: {
      return {
        ...state,
        stats: {
          ...state.stats,
          [action.projectID]: [],
        },
        error: undefined,
      };
    }

    case PROJECT_STATS_LOADED: {
      return {
        ...state,
        stats: {
          ...state.stats,
          [action.projectID]: action.stats,
        },
        error: undefined,
      };
    }

    case PROJECT_APPLICATIONS_ERROR: {
      return {
        ...state,
        error: action.error,
      };
    }

    default: {
      return state;
    }
  }
};
