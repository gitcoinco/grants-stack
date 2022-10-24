import "@testing-library/jest-dom";
import {
  AppStatus,
  projectsReducer,
  ProjectsState,
  Status,
} from "../../reducers/projects";

describe("projects reducer", () => {
  let state: ProjectsState;

  beforeEach(() => {
    state = {
      status: Status.Undefined,
      error: undefined,
      ids: [],
      events: {},
      applications: {
        error: undefined,
      },
    };
  });
  it("PROJECT_APPLICATIONS_LOADING updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_LOADING",
      projectID: 12345,
      roundID: "0x1234",
    });

    expect(newState.applications[12345].status).toBe(Status.Loading);
    expect(newState.applications[12345].applicationStatus[0].roundID).toBe(
      "0x1234"
    );
    expect(newState.applications[12345].applicationStatus[0].status).toBe(
      AppStatus.Pending
    );
  });

  it("PROJECT_APPLICATIONS_LOADED updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_LOADED",
      projectID: 12345,
      applications: {
        roundID: "0x1234",
        status: AppStatus.Pending,
      },
    });

    expect(newState.applications[12345].status).toBe(Status.Loaded);
    expect(newState.applications[12345].applicationStatus[0].roundID).toBe(
      "0x1234"
    );
  });

  it("PROJECT_APPLICATIONS_NOT_FOUND updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_NOT_FOUND",
      projectID: 12345,
      roundID: "0x1234",
    });

    expect(newState.applications[12345].status).toBe(Status.Loaded);
    expect(newState.applications[12345].applicationStatus[0].roundID).toBe(
      "0x1234"
    );
    expect(newState.applications[12345].applicationStatus[0].status).toBe(
      AppStatus.NotFound
    );
  });

  it("PROJECT_APPLICATIONS_ERROR updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_ERROR",
      projectID: 12345,
      roundID: "0x1234",
      error: "error",
    });

    expect(newState.applications[12345].status).toBe(Status.Error);
    expect(newState.applications[12345].applicationStatus[0].status).toBe(
      AppStatus.Unknown
    );
    expect(newState.applications.error).toBe("error");
  });
});
