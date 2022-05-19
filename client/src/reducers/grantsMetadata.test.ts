import { Store, combineReducers, createStore } from "redux";
import {
  grantMetadataFetched,
  grantMetadataLoading,
} from "../actions/grantsMetadata";
import { Metadata } from "../types";
import { grantsMetadataReducer, initialState } from "./grantsMetadata";

describe("newGrant reducer", () => {
  let store: Store;
  beforeEach(() => {
    store = createStore(combineReducers({ newGrant: grantsMetadataReducer }));
  });

  it("sets loading status", () => {
    store.dispatch(grantMetadataLoading(1));
    expect(store.getState().grantsMetadata[1]).toEqual({
      loading: true,
    });
  });

  it("saves current grant to store", () => {
    const grantMetadata: Metadata = {
      uri: "0x1234",
      id: 1,
      title: "Title",
      description: "Description",
      website: "www.grant.com",
      chain: "ethereum",
      wallet: "0x000",
      receivedFunding: false,
    };
    store.dispatch(grantMetadataFetched(grantMetadata));
    expect(store.getState().grants[1]).toEqual({
      loading: false,
      metadata: grantMetadata,
    });
  });
});
