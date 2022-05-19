import { Store, combineReducers, createStore } from "redux";
import {
  grantMetadataFetched,
  grantMetadataLoading,
  grantMetadataLoadingURI,
} from "../actions/grantsMetadata";
import { Metadata } from "../types";
import { grantsMetadataReducer } from "./grantsMetadata";

const grantId = 1;

describe("grantsMetaData reducer", () => {
  let store: Store;
  beforeEach(() => {
    store = createStore(
      combineReducers({ grantsMetaData: grantsMetadataReducer })
    );
  });

  it("sets loading status", () => {
    store.dispatch(grantMetadataLoadingURI(1));
    store.dispatch(grantMetadataLoading(grantId));
    expect(store.getState().grantsMetaData[1]).toEqual({
      loading: true,
      metadata: undefined,
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
    store.dispatch(
      grantMetadataFetched({
        ...grantMetadata,
        uri: grantMetadata.uri,
        id: grantId,
      })
    );

    expect(store.getState().grantsMetaData[1]).toEqual({
      loading: false,
      metadata: grantMetadata,
    });
  });
});
