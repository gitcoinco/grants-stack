import "@testing-library/jest-dom";
import {
  roundApplicationReducer,
  RoundApplicationState,
  Status,
} from "../../reducers/roundApplication";
import setupStore from "../../store";
import { addressFrom } from "../../utils/test_utils";

describe("roundApplication reducer", () => {
  let state: RoundApplicationState;
  let store: ReturnType<typeof setupStore>;
  const roundAddress: string = addressFrom(1);

  beforeEach(() => {
    state = {};
    store = setupStore();
  });

  it("ROUND_APPLICATION_LOADING updates state", async () => {
    expect(store.getState().roundApplication).toEqual({});

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
    expect(newState[roundAddress].projectsIDs).toEqual([1]);
    expect(newState[roundAddress].error).toBeUndefined();
    expect(newState[roundAddress].projectsIDs[0]).toBe(1);
  });

  it("ROUND_APPLICATION_ERROR updates state", async () => {
    expect(store.getState().roundApplication).toEqual({});

    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_ERROR",
      roundAddress,
      error: "error",
      step: Status.BuildingApplication,
    });
    expect(newState[roundAddress].status).toBe(Status.Error);
    expect(newState[roundAddress].error?.error).toBe("error");
    expect(newState[roundAddress].error?.step).toBe(Status.BuildingApplication);
  });

  it("ROUND_APPLICATION_FOUND updates state", async () => {
    expect(store.getState().roundApplication).toEqual({});

    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_FOUND",
      roundAddress,
      projectID: 1,
    });
    expect(newState[roundAddress].status).toBe(Status.Found);
    expect(newState[roundAddress].projectsIDs[0]).toBe(1);
    expect(newState[roundAddress].error).toBeUndefined();
  });

  it("ROUND_APPLICATION_NOT_FOUND updates state", async () => {
    expect(store.getState().roundApplication).toEqual({});

    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_NOT_FOUND",
      roundAddress,
    });
    expect(newState[roundAddress].status).toBe(Status.NotFound);
  });

  it("ROUND_APPLICATION_RESET updates state", async () => {
    expect(store.getState().roundApplication).toEqual({});
    // Update the state to make sure reset is working properly and clearing the round application
    store.dispatch({
      type: "ROUND_APPLICATION_LOADING",
      roundAddress,
      status: Status.BuildingApplication,
    });

    const newState: RoundApplicationState = roundApplicationReducer(state, {
      type: "ROUND_APPLICATION_RESET",
      roundAddress,
    });
    expect(newState[roundAddress]).toBeUndefined();
  });
});
