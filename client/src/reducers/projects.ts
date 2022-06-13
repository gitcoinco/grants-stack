import {
  ProjectsActions,
  PROJECTS_LOADING,
  PROJECTS_LOADED,
  PROJECTS_UNLOADED,
} from "../actions/projects";
import { ProjectEvent } from "../types";

export interface ProjectsState {
  loading: boolean;
  projects: ProjectEvent[];
}

const initialState = {
  loading: false,
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
        loading: true,
        projects: [],
      };
    }

    case PROJECTS_LOADED: {
      const { projects } = action;

      return {
        ...state,
        loading: false,
        projects,
      };
    }

    case PROJECTS_UNLOADED: {
      return {
        ...state,
        loading: false,
        projects: [],
      };
    }
    default: {
      return state;
    }
  }
};
