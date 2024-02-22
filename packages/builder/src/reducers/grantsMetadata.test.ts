import { combineReducers, createStore, Store } from "redux";
import {
  grantMetadataFetched,
  grantMetadataLoading,
  grantMetadataLoadingURI,
} from "../actions/grantsMetadata";
import { Metadata } from "../types";
import { grantsMetadataReducer, Status } from "./grantsMetadata";

const grantId = "1:1:1";

describe("grantsMetaData reducer", () => {
  let store: Store;
  beforeEach(() => {
    store = createStore(
      combineReducers({ grantsMetaData: grantsMetadataReducer })
    );
  });

  it("sets loading status", () => {
    store.dispatch(grantMetadataLoadingURI("1:1:1"));
    store.dispatch(grantMetadataLoading(grantId));
    expect(store.getState().grantsMetaData["1:1:1"]).toEqual({
      status: Status.Loading,
      metadata: undefined,
    });
  });

  it("saves current grant to store", () => {
    const grantMetadata: Metadata = {
      protocol: 1,
      pointer: "0x1234",
      id: "1:1:1",
      title: "Title",
      description: "Description",
      website: "www.grant.com",
      chainId: 1,
      registryAddress: "0x1",
    };
    store.dispatch(
      grantMetadataFetched({
        ...grantMetadata,
        protocol: grantMetadata.protocol,
        pointer: grantMetadata.pointer,
        id: grantId,
      })
    );

    expect(store.getState().grantsMetaData["1:1:1"]).toEqual({
      status: Status.Loaded,
      metadata: grantMetadata,
    });
  });
});
