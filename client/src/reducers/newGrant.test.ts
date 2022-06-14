import { Store, combineReducers, createStore } from "redux";
import { grantCreated, grantTXStatus } from "../actions/newGrant";
import { newGrantReducer, initialState, NewGrant } from "./newGrant";

describe("newGrant reducer", () => {
  let store: Store;
  beforeEach(() => {
    store = createStore(combineReducers({ newGrant: newGrantReducer }));
  });

  it("marks tx status", () => {
    const initiated = "initiated";
    const complete = "complete";
    store.dispatch(grantTXStatus(initiated));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      txStatus: initiated,
    });

    store.dispatch(grantTXStatus(complete));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      txStatus: complete,
    });
  });
});
