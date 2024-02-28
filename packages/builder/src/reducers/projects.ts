import { ProjectApplicationWithRound, ProjectEventsMap } from "data-layer";

import {
  PROJECTS_ERROR,
  PROJECTS_LOADED,
  PROJECTS_LOADING,
  PROJECTS_UNLOADED,
  PROJECT_ANCHORS_LOADED,
  PROJECT_APPLICATIONS_ERROR,
  PROJECT_APPLICATIONS_LOADED,
  PROJECT_APPLICATIONS_LOADING,
  PROJECT_APPLICATION_UPDATED,
  PROJECT_OWNERS_LOADED,
  PROJECT_STATS_LOADED,
  PROJECT_STATS_LOADING,
  ProjectsActions,
} from "../actions/projects";

export enum Status {
  Undefined = 0,
  Loading,
  Loaded,
  Error,
}

export type ProjectOwners = { [projectID: string]: string[] };
export interface ProjectsState {
  status: Status;
  loadingChains: number[];
  error: string | undefined;
  ids: string[];
  events: ProjectEventsMap;
  owners: ProjectOwners;
  anchor?: { [anchor: string]: string };
  applications?: {
    [projectID: string]: ProjectApplicationWithRound[];
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
  anchor: {},
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
        loadingChains: [...state.loadingChains, ...action.payload],
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
      return {
        ...state,
        status: Status.Loaded,
        loadingChains: [],
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
        state.applications || {};

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
      const projectApplications = state.applications?.[action.projectID] || [];
      const index = projectApplications.findIndex(
        (app: ProjectApplicationWithRound) => app.roundId === action.roundID
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

    case PROJECT_ANCHORS_LOADED: {
      return {
        ...state,
        anchor: {
          ...state.anchor,
          [action.payload.projectID]: action.payload.anchor,
        },
      };
    }

    default: {
      return state;
    }
  }
};
