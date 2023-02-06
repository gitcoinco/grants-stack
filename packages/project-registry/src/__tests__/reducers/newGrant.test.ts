import {
  NEW_GRANT_STATUS,
  NEW_GRANT_ERROR,
  RESET_STATUS,
} from "../../actions/newGrant";
import {
  newGrantReducer,
  NewGrantState,
  initialState,
  Status,
} from "../../reducers/newGrant";

describe("newGrant reducer", () => {
  let state: NewGrantState;
  beforeEach(() => {
    state = initialState;
  });

  it("NEW_GRANT_STATUS should initialize a new grant", () => {
    const newState: NewGrantState = newGrantReducer(state, {
      type: NEW_GRANT_STATUS,
      status: Status.Undefined,
    });

    expect(newState.status).toEqual(Status.Undefined);
  });

  it("NEW_GRANT_ERROR should update state and preserve last status", () => {
    const errorMessage = "Error occurred while processing grant";

    const newState: NewGrantState = newGrantReducer(state, {
      type: NEW_GRANT_ERROR,
      error: errorMessage,
      step: Status.UploadingJSON,
    });

    expect(newState).toEqual({
      ...initialState,
      status: Status.Error,
      error: {
        error: errorMessage,
        step: Status.UploadingJSON,
      },
    });
  });

  it("RESET_STATUS should reset grant state to default", () => {
    const newState: NewGrantState = newGrantReducer(state, {
      type: RESET_STATUS,
    });

    expect(newState).toEqual(initialState);
  });
});
