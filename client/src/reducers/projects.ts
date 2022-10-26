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

export const enum Status {
  Undefined = 0,
  Loading,
  Loaded,
  Error,
}

export const enum AppStatus {
  Accepted,
  Rejected,
  Pending,
  NotFound,
  Unknown,
}

export type ApplicationStatus = {
  roundID: string;
  status: AppStatus;
};

export interface ProjectsState {
  status: Status;
  error: string | undefined;
  ids: number[];
  events: ProjectEventsMap;
  applications: {
    [projectId: number]: {
      status: Status;
      applicationStatus: [ApplicationStatus];
    };
    error: string | undefined;
  };
}

const initialState: ProjectsState = {
  status: Status.Undefined,
  error: undefined,
  ids: [],
  events: {},
  applications: {
    error: undefined,
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
      const { projectID, roundID } = action;
      return {
        ...state,
        applications: {
          [projectID]: {
            status: Status.Loading,
            applicationStatus: [{ roundID, status: AppStatus.Pending }],
          },
          error: undefined,
        },
      };
    }

    case PROJECT_APPLICATIONS_NOT_FOUND: {
      const { projectID, roundID } = action;
      return {
        ...state,
        applications: {
          [projectID]: {
            // I used loaded status here because it's not an error
            status: Status.Loaded,
            applicationStatus: [
              {
                roundID,
                status: AppStatus.NotFound,
              },
            ],
          },
          error: undefined,
        },
      };
    }

    case PROJECT_APPLICATIONS_LOADED: {
      const { projectID, applications } = action;
      return {
        ...state,
        applications: {
          [projectID]: {
            status: Status.Loaded,
            applicationStatus: [applications],
          },
          error: undefined,
        },
        status: Status.Loaded,
      };
    }

    case PROJECT_APPLICATIONS_ERROR: {
      const { projectID, roundID, error } = action;
      return {
        ...state,
        applications: {
          [projectID]: {
            status: Status.Error,
            applicationStatus: [
              {
                roundID,
                status: AppStatus.Unknown,
              },
            ],
          },
          error,
        },
      };
    }

    default: {
      return state;
    }
  }
};
