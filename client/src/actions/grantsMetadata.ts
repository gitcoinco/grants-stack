import { ethers } from "ethers";
import { Dispatch } from "redux";
import { RootState } from "../reducers";
import { Metadata } from "../types";
import { global } from "../global";
import { addressesByChainID } from "../contracts/deployments";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { LocalStorage } from "../services/Storage";
import PinataClient from "../services/pinata";

export const GRANT_METADATA_LOADING_URI = "GRANT_METADATA_LOADING_URI";
export interface GrantMetadataLoadingURI {
  type: typeof GRANT_METADATA_LOADING_URI;
  id: number;
}

export const GRANT_METADATA_LOADING = "GRANT_METADATA_LOADING";
export interface GrantMetadataLoading {
  type: typeof GRANT_METADATA_LOADING;
  id: number;
}

export const GRANT_METADATA_FETCHED = "GRANT_METADATA_FETCHED";
export interface GrantMetadataFetched {
  type: typeof GRANT_METADATA_FETCHED;
  data: Metadata;
}

export type GrantMetadataActions =
  | GrantMetadataLoadingURI
  | GrantMetadataLoading
  | GrantMetadataFetched;

export const grantMetadataLoadingURI = (id: number): GrantMetadataActions => ({
  type: GRANT_METADATA_LOADING_URI,
  id,
});

export const grantMetadataLoading = (id: number): GrantMetadataActions => ({
  type: GRANT_METADATA_LOADING,
  id,
});

export const grantMetadataFetched = (data: Metadata): GrantMetadataActions => ({
  type: GRANT_METADATA_FETCHED,
  data,
});

export const fetchGrantData =
  (id: number) => async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(grantMetadataLoadingURI(id));
    const state = getState();
    const { chainID } = state.web3;
    const addresses = addressesByChainID(chainID!);
    const signer = global.web3Provider?.getSigner();

    const projectRegistry = new ethers.Contract(
      addresses.projectRegistry,
      ProjectRegistryABI,
      signer
    );

    let project: {
      metadata: {
        protocol: number;
        pointer: string;
      };
    };

    try {
      project = await projectRegistry.projects(id);
    } catch (e) {
      // FIXME: dispatch contract interaction error
      console.error(e);
      return;
    }

    // FIXME: the contract will always return a project,
    // check one field to know if it exists.
    if (project === null) {
      // FIXME: dispatch "not found"
      console.error("project not found");
      return;
    }

    dispatch(grantMetadataLoading(id));

    const cacheKey = `project-${id}-${project.metadata.protocol}-${project.metadata.pointer}`;
    const storage = new LocalStorage();
    if (storage.supported) {
      const item = storage.get(cacheKey);
      if (item !== null) {
        try {
          const metadata = JSON.parse(item);
          dispatch(
            grantMetadataFetched({
              ...metadata,
              protocol: project.metadata.protocol,
              pointer: project.metadata.pointer,
              id,
            })
          );

          return;
        } catch (e) {
          // FIXME: dispatch error
          console.log("error parsing cached project metadata", e);
        }
      }
    }

    // if not cached in localstorage
    let content;
    try {
      // FIXME: fetch from pinata gateway
      const pinataClient = new PinataClient();
      content = await pinataClient.fetchText(project.metadata.pointer);
    } catch (e) {
      // FIXME: dispatch "ipfs error"
      console.error(e);
      return;
    }

    let metadata: Metadata;
    try {
      metadata = JSON.parse(content);
    } catch (e) {
      // FIXME: dispatch JSON error
      console.error(e);
      return;
    }

    const item = {
      ...metadata,
      protocol: project.metadata.protocol,
      pointer: project.metadata.pointer,
      id,
    };

    dispatch(grantMetadataFetched(item));
    storage.add(cacheKey, JSON.stringify(item));
  };
