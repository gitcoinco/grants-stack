import { Store } from "redux";
import { grantError, grantStatus, resetStatus } from "../../actions/newGrant";
import { initialState, Status } from "../../reducers/newGrant";
import setupStore from "../../store";

describe("newGrant reducer", () => {
  let store: Store;
  beforeEach(() => {
    store = setupStore();
  });

  it("NEW_GRANT_STATUS should initialize a new grant", () => {
    store.dispatch(grantStatus(Status.Undefined));

    expect(store.getState().newGrant).toEqual({
      ...initialState,
      status: Status.Undefined,
    });

    store.dispatch(grantStatus(Status.Completed));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      status: Status.Completed,
    });
  });

  it("NEW_GRANT_ERROR should update state and preserve last status", () => {
    const errorMessage = "Error occurred while processing grant";

    store.dispatch(grantError(errorMessage, Status.UploadingJSON));

    expect(store.getState().newGrant).toEqual({
      ...initialState,
      status: Status.Error,
      error: {
        error: errorMessage,
        step: Status.UploadingJSON,
      },
    });
  });

  it("RESET_STATUS should reset grant state to default", () => {
    store.dispatch(resetStatus());

    expect(store.getState().newGrant).toEqual({
      ...initialState,
      status: Status.Undefined,
      error: undefined,
    });
  });
});
