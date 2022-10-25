import {
  ProjectsActions,
  PROJECTS_LOADED,
  PROJECTS_LOADING,
  PROJECTS_UNLOADED,
  PROJECT_APPLICATIONS_ERROR,
  PROJECT_APPLICATIONS_LOADED,
  PROJECT_APPLICATIONS_LOADING,
  PROJECT_APPLICATIONS_NOT_FOUND,
} from "../actions/projects";
import { ProjectEventsMap } from "../types";

export enum Status {
  Undefined = 0,
  Loading,
  Loaded,
  Error,
}

export enum AppStatus {
  Accepted,
  Rejected,
  Pending,
  NotFound,
  Unknown,
}

export type RoundProject = {
  projectID: string;
  status: AppStatus;
  round: {
    id: string;
  };
};

export interface ProjectsState {
  status: Status;
  error: string | undefined;
  ids: number[];
  events: ProjectEventsMap;
  applications: {
    projects: RoundProject[];
    status: Status;
  };
}

const initialState: ProjectsState = {
  status: Status.Undefined,
  error: undefined,
  ids: [],
  events: {},
  applications: {
    projects: [],
    status: Status.Undefined,
  },
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
        ids: [],
      };
    }

    case PROJECTS_LOADED: {
      const { events } = action;
      const ids = Object.keys(events).map((id) => Number(id));

      return {
        ...state,
        status: Status.Loaded,
        ids,
        events,
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
      // const { projectID, roundID } = action;
      return {
        ...state,
        applications: {
          projects: state.applications.projects,
          status: Status.Loading,
        },
        error: undefined,
      };
    }

    case PROJECT_APPLICATIONS_NOT_FOUND: {
      // const { projectID, roundID } = action;
      return {
        ...state,
        applications: {
          projects: state.applications.projects,
          status: Status.Loaded,
        },
        error: undefined,
      };
    }

    case PROJECT_APPLICATIONS_LOADED: {
      const {
        projectID,
        applications,
      }: {
        projectID: string;
        applications: RoundProject[];
      } = action;
      console.log("applications", projectID, applications);
      return {
        ...state,
        applications: {
          projects: applications,
          status: Status.Loaded,
        },
        error: undefined,
        status: Status.Loaded,
      };
    }

    case PROJECT_APPLICATIONS_ERROR: {
      const { error } = action;
      return {
        ...state,
        applications: {
          projects: [],
          status: Status.Error,
        },
        error,
        status: Status.Error,
      };
    }

    default: {
      return state;
    }
  }
};
