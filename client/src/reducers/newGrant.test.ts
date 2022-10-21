import { Store, combineReducers, createStore } from "redux";
import { grantStatus } from "../actions/newGrant";
import { newGrantReducer, initialState, Status } from "./newGrant";

describe("newGrant reducer", () => {
  let store: Store;
  beforeEach(() => {
    store = createStore(combineReducers({ newGrant: newGrantReducer }));
  });

  it("marks tx status", () => {
    const initiated = Status.Undefined;
    const complete = Status.Completed;
    store.dispatch(grantStatus(initiated));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      status: initiated,
    });

    store.dispatch(grantStatus(complete));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      status: complete,
    });
  });
});
