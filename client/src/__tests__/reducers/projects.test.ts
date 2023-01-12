import "@testing-library/jest-dom";
import {
  AppStatus,
  projectsReducer,
  ProjectsState,
  Status,
} from "../../reducers/projects";
import { addressFrom } from "../../utils/test_utils";

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
      "2": [],
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
});
