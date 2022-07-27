import {
  ProjectsActions,
  PROJECTS_LOADING,
  PROJECTS_LOADED,
  PROJECTS_UNLOADED,
} from "../actions/projects";
import { ProjectEvent } from "../types";

export const enum Status {
  Undefined = 0,
  Loading,
  Loaded,
  Error,
}

export interface ProjectsState {
  projects: ProjectEvent[];
  status: Status;
  error: string | undefined;
}

const initialState = {
  status: Status.Undefined,
  error: undefined,
  projects: [],
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
        projects: [],
      };
    }

    case PROJECTS_LOADED: {
      const { projects } = action;

      return {
        ...state,
        status: Status.Loaded,
        projects,
      };
    }

    case PROJECTS_UNLOADED: {
      return {
        ...state,
        status: Status.Undefined,
        projects: [],
      };
    }
    default: {
      return state;
    }
  }
};
