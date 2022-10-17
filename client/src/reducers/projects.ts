import {
  ProjectsActions,
  PROJECTS_LOADING,
  PROJECTS_LOADED,
  PROJECTS_UNLOADED,
} from "../actions/projects";
import { ProjectEventsMap } from "../types";

export const enum Status {
  Undefined = 0,
  Loading,
  Loaded,
  Error,
}

export interface ProjectsState {
  status: Status;
  error: string | undefined;
  ids: number[];
  events: ProjectEventsMap;
}

const initialState = {
  status: Status.Undefined,
  error: undefined,
  ids: [],
  events: {},
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
    default: {
      return state;
    }
  }
};
