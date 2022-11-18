import "@testing-library/jest-dom";
import {
  projectsReducer,
  ProjectsState,
  Status,
  AppStatus,
} from "../../reducers/projects";

describe("projects reducer", () => {
  let state: ProjectsState;

  beforeEach(() => {
    state = {
      status: Status.Undefined,
      error: undefined,
      ids: [],
      events: {},
      applications: {},
    };
  });

  it("PROJECT_APPLICATIONS_LOADING updates state", async () => {
    const initialState = {
      ...state,
      applications: {
        "1": [{ roundID: "0x1234", status: "PENDING" as AppStatus }],
        "2": [{ roundID: "0x4567", status: "PENDING" as AppStatus }],
      },
    };

    const newState: ProjectsState = projectsReducer(initialState, {
      type: "PROJECT_APPLICATIONS_LOADING",
      projectID: "2",
    });

    expect(newState.applications).toEqual({
      "1": [{ roundID: "0x1234", status: "PENDING" }],
      "2": [],
    });
  });

  it("PROJECT_APPLICATIONS_LOADED updates state", async () => {
    const initialState = {
      ...state,
      applications: {
        "1": [{ roundID: "0x1234", status: "PENDING" as AppStatus }],
      },
    };

    const newState: ProjectsState = projectsReducer(initialState, {
      type: "PROJECT_APPLICATIONS_LOADED",
      projectID: "2",
      applications: [
        {
          roundID: "0x3456",
          status: "APPROVED",
        },
      ],
    });

    expect(newState.applications).toEqual({
      "1": [{ roundID: "0x1234", status: "PENDING" }],
      "2": [{ roundID: "0x3456", status: "APPROVED" }],
    });
  });

  it("PROJECT_APPLICATIONS_ERROR updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_ERROR",
      projectID: "12345",
      error: "error",
    });

    expect(newState.error).toBe("error");
  });
});
