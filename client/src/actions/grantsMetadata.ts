import { ethers } from "ethers";
import { Dispatch } from "redux";
import { RootState } from "../reducers";
import { Metadata, ProjectRegistryMetadata } from "../types";
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

export const GRANT_METADATA_FETCHING_ERROR = "GRANT_METADATA_FETCHING_ERROR";
interface GrantMetadataFetchingError {
  type: typeof GRANT_METADATA_FETCHING_ERROR;
  id: number;
  error: string;
}

export type GrantMetadataActions =
  | GrantMetadataLoadingURI
  | GrantMetadataLoading
  | GrantMetadataFetched
  | GrantMetadataFetchingError;

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

export const grantMetadataFetchingError = (
  id: number,
  error: string
): GrantMetadataActions => ({
  type: GRANT_METADATA_FETCHING_ERROR,
  id,
  error,
});

const getProjectById = async (
  projectId: number,
  addresses: any,
  signer: ethers.providers.JsonRpcSigner
) => {
  const projectRegistry = new ethers.Contract(
    addresses.projectRegistry,
    ProjectRegistryABI,
    signer
  );

  const project: ProjectRegistryMetadata = await projectRegistry.projects(
    projectId
  );

  return project;
};

const getMetadata = async (
  projectId: number,
  project: any,
  cacheKey: string
) => {
  const storage = new LocalStorage();
  let metadata: Metadata;

  if (storage.supported) {
    const item = storage.get(cacheKey);
    if (item !== null) {
      try {
        metadata = JSON.parse(item);

        const ret = {
          ...metadata,
          protocol: project.metadata.protocol,
          pointer: project.metadata.pointer,
          id: projectId,
        };
        storage.add(cacheKey, JSON.stringify(ret));
        return ret;
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
    return null;
  }

  try {
    metadata = JSON.parse(content);
  } catch (e) {
    // FIXME: dispatch JSON error
    console.error(e);
    return null;
  }

  const ret = {
    ...metadata,
    protocol: project.metadata.protocol,
    pointer: project.metadata.pointer,
    projectId,
  };
  storage.add(cacheKey, JSON.stringify(ret));
  return ret;
};

export const fetchGrantData =
  (id: number) => async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(grantMetadataLoadingURI(id));
    const state = getState();
    const { chainID } = state.web3;
    const addresses = addressesByChainID(chainID!);
    const signer = global.web3Provider?.getSigner();

    let project: ProjectRegistryMetadata;

    try {
      project = await getProjectById(id, addresses, signer!);
    } catch (e) {
      console.error("error fetching project by id", e);
      dispatch(grantMetadataFetchingError(id, "error fetching project by id"));
      return;
    }

    if (!project.metadata.protocol) {
      console.error("project not found");
      dispatch(grantMetadataFetchingError(id, "project not found"));
      return;
    }

    dispatch(grantMetadataLoading(id));

    const cacheKey = `project-${id}-${project.metadata.protocol}-${project.metadata.pointer}`;
    const item = await getMetadata(id, project, cacheKey);

    if (item === null) {
      console.log("item is null");
      dispatch(grantMetadataFetchingError(id, "error fetching metadata"));
      return;
    }

    dispatch(grantMetadataFetched(item));
  };
