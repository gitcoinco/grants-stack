import "@testing-library/jest-dom";
import {
  AppStatus,
  projectsReducer,
  ProjectsState,
  Status,
  initialState as initialProjectsState,
} from "../../reducers/projects";
import { addressFrom } from "../../utils/test_utils";

describe("projects reducer", () => {
  let state: ProjectsState;

  beforeEach(() => {
    state = initialProjectsState;
  });

  it("PROJECT_APPLICATIONS_LOADING updates state", async () => {
    const initialState = {
      ...state,
      applications: {
        "1": [
          {
            roundID: addressFrom(1),
            status: "PENDING" as AppStatus,
            chainId: 1,
          },
        ],
        "2": [
          {
            roundID: addressFrom(2),
            status: "PENDING" as AppStatus,
            chainId: 1,
          },
        ],
      },
    };

    const newState: ProjectsState = projectsReducer(initialState, {
      type: "PROJECT_APPLICATIONS_LOADING",
      projectID: "2",
    });

    expect(newState.applications).toEqual({
      "1": [
        {
          roundID: addressFrom(1),
          status: "PENDING",
          chainId: 1,
        },
      ],
    });
  });

  it("PROJECT_APPLICATIONS_LOADED updates state", async () => {
    const initialState = {
      ...state,
      applications: {
        "1": [
          {
            roundID: addressFrom(1),
            status: "PENDING" as AppStatus,
            chainId: 1,
          },
        ],
      },
    };

    const newState: ProjectsState = projectsReducer(initialState, {
      type: "PROJECT_APPLICATIONS_LOADED",
      projectID: "2",
      applications: [
        {
          roundID: addressFrom(2),
          status: "APPROVED",
          chainId: 1,
        },
      ],
    });

    expect(newState.applications).toEqual({
      "1": [
        {
          roundID: addressFrom(1),
          status: "PENDING",
          chainId: 1,
        },
      ],
      "2": [
        {
          roundID: addressFrom(2),
          status: "APPROVED",
          chainId: 1,
        },
      ],
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

  it("PROJECT_APPLICATION_UPDATED updates a project application status", async () => {
    const initialState = {
      ...state,
      applications: {
        "1": [{ roundID: "0x1", status: "PENDING" as AppStatus, chainId: 1 }],
        "2": [
          { roundID: "0x1", status: "PENDING" as AppStatus, chainId: 1 },
          { roundID: "0x2", status: "PENDING" as AppStatus, chainId: 1 },
          { roundID: "0x3", status: "PENDING" as AppStatus, chainId: 1 },
          { roundID: "0x4", status: "PENDING" as AppStatus, chainId: 1 },
        ],
        "3": [{ roundID: "0x3", status: "PENDING" as AppStatus, chainId: 1 }],
      },
    };

    const newState: ProjectsState = projectsReducer(initialState, {
      type: "PROJECT_APPLICATION_UPDATED",
      projectID: "2",
      roundID: "0x3",
      status: "APPROVED",
    });

    expect(newState.applications).toEqual({
      "1": [{ roundID: "0x1", status: "PENDING" as AppStatus, chainId: 1 }],
      "2": [
        { roundID: "0x1", status: "PENDING" as AppStatus, chainId: 1 },
        { roundID: "0x2", status: "PENDING" as AppStatus, chainId: 1 },
        { roundID: "0x3", status: "APPROVED" as AppStatus, chainId: 1 },
        { roundID: "0x4", status: "PENDING" as AppStatus, chainId: 1 },
      ],
      "3": [{ roundID: "0x3", status: "PENDING" as AppStatus, chainId: 1 }],
    });
  });

  it("handles multiple chain loading states", async () => {
    // start loading chain 0
    const state1: ProjectsState = projectsReducer(state, {
      type: "PROJECTS_LOADING",
      payload: 0,
    });

    expect(state1.status).toEqual(Status.Loading);
    expect(state1.loadingChains.length).toEqual(1);

    // start loading chain 1
    const state2: ProjectsState = projectsReducer(state1, {
      type: "PROJECTS_LOADING",
      payload: 1,
    });

    expect(state2.status).toEqual(Status.Loading);
    expect(state2.loadingChains.length).toEqual(2);

    // mark chain 1 as done
    const state3: ProjectsState = projectsReducer(state2, {
      type: "PROJECTS_LOADED",
      payload: {
        chainID: 1,
        events: {},
      },
    });

    expect(state3.status).toEqual(Status.Loading);
    expect(state3.loadingChains.length).toEqual(1);

    // mark chain 0 as done
    const state4: ProjectsState = projectsReducer(state3, {
      type: "PROJECTS_LOADED",
      payload: {
        chainID: 0,
        events: {},
      },
    });

    expect(state4.status).toEqual(Status.Loaded);
    expect(state4.loadingChains.length).toEqual(0);
  });
});
