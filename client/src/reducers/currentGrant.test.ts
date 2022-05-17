import { Store, combineReducers, createStore } from "redux";
import {
  currentGrantFetched,
  currentGrantLoading,
} from "../actions/currentGrant";
import { MetaData } from "../types";
import { currentGrantReducer, initialState } from "./currentGrant";

describe("newGrant reducer", () => {
  let store: Store;
  beforeEach(() => {
    store = createStore(combineReducers({ newGrant: currentGrantReducer }));
  });

  it("sets loading status", () => {
    store.dispatch(currentGrantLoading(true));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      loading: true,
    });

    store.dispatch(currentGrantLoading(false));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      loading: false,
    });
  });

  it("saves current grant to store", () => {
    const currentGrant: MetaData = {
      title: "Title",
      description: "Description",
      website: "www.grant.com",
      chain: "ethereum",
      wallet: "0x000",
      receivedFunding: false,
    };
    store.dispatch(currentGrantFetched(currentGrant));
    expect(store.getState().newGrant).toEqual({
      ...initialState,
      currentGrant,
    });
  });
});
