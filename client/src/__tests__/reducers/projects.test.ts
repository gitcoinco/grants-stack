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
        projects: [],
        status: Status.Undefined,
      },
    };
  });
  it("PROJECT_APPLICATIONS_LOADING updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_LOADING",
    });

    expect(newState.applications.status).toBe(Status.Loading);
  });

  it("PROJECT_APPLICATIONS_LOADED updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_LOADED",
      projectID: "12345",
      applications: {
        projects: [
          {
            id: "12345",
            status: AppStatus.Accepted,
            round: {
              id: "0x1234"
            },
          },
        ],
        roundID: "0x1234",
        status: Status.Loaded,
      },
    });

    console.log("New State", newState.applications.projects);

    expect(newState.applications.status).toBe(Status.Loaded);
  });

  it("PROJECT_APPLICATIONS_NOT_FOUND updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_NOT_FOUND",
      // projectID: "12345",
      // roundID: "0x1234",
    });

    expect(newState.applications.status).toBe(Status.Loaded);
  });

  it("PROJECT_APPLICATIONS_ERROR updates state", async () => {
    const newState: ProjectsState = projectsReducer(state, {
      type: "PROJECT_APPLICATIONS_ERROR",
      // projectID: 12345,
      // roundID: "0x1234",
      error: "error",
    });

    expect(newState.applications.status).toBe(Status.Error);
    expect(newState.error).toBe("error");
  });
});
