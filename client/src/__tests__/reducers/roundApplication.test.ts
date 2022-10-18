import "@testing-library/jest-dom";
import {
  roundApplicationReducer,
  RoundApplicationState,
  Status
} from "../../reducers/roundApplication";
import setupStore from "../../store";

describe("roundApplication reducer", () => {
  let state: RoundApplicationState;
  let store: ReturnType<typeof setupStore>;
  const roundAddress: string = "0x1234";

  beforeEach(() => {
    state = {};
    store = setupStore();
  });

  it("ROUND_APPLICATION_LOADING updates state", async () => {
    // sets the status to loading
    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_LOADING",
      roundAddress,
      status: Status.BuildingApplication,
    });
    expect(newState[roundAddress].status).toEqual(Status.BuildingApplication);
  });

  it("ROUND_APPLICATION_LOADED updates state", async () => {
    expect(store.getState().roundApplication).toEqual({});

    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_LOADED",
      roundAddress,
      projectId: 1,
    });
    expect(newState[roundAddress].status).toBe(Status.Sent);
    expect(newState[roundAddress].projectsIDs[0]).toBe(1);
  });

  it("ROUND_APPLICATION_ERROR updates state", async () => {
    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_ERROR",
      roundAddress: roundAddress,
      error: "error",
      step: Status.BuildingApplication,
    });
    expect(newState[roundAddress].status).toBe(Status.Error);
    expect(newState[roundAddress].error?.error).toBe("error");
    expect(newState[roundAddress].error?.step).toBe(Status.BuildingApplication);
  });

  it("ROUND_APPLICATION_FOUND updates state", async () => {
    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_FOUND",
      roundAddress,
      projectID: 1,
    });
    expect(newState[roundAddress].status).toBe(Status.Found);
    expect(newState[roundAddress].projectsIDs[0]).toBe(1);
  });

  it("ROUND_APPLICATION_NOT_FOUND updates state", async () => {
    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_NOT_FOUND",
      roundAddress,
    });
    expect(newState[roundAddress].status).toBe(Status.NotFound);
  });

  it("ROUND_APPLICATION_RESET updates state", async () => {
    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_RESET",
      roundAddress,
    });
    expect(newState[roundAddress].status).toBe(Status.Undefined);
  });
});
