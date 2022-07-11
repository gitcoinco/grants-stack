import { Store, combineReducers, createStore } from "redux";
import { grantStatus } from "../actions/newGrant";
import { newGrantReducer, initialState, Status } from "./newGrant";

describe("newGrant reducer", () => {
  let store: Store;
  beforeEach(() => {
    store = createStore(combineReducers({ newGrant: newGrantReducer }));
  });

  it("marks tx status", () => {
    const initiated = Status.Ready;
    const complete = Status.Completed;
    store.dispatch(grantStatus(initiated, undefined));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      status: initiated,
    });

    store.dispatch(grantStatus(complete, undefined));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      status: complete,
    });
  });
});
