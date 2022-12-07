import { datadogRum } from "@datadog/browser-rum";
import { ethers } from "ethers";
import { Dispatch } from "redux";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import PinataClient from "../services/pinata";
import { LocalStorage } from "../services/Storage";
import { Metadata, ProjectRegistryMetadata } from "../types";
import { getProjectURIComponents, getProviderByChainId } from "../utils/utils";

export const GRANT_METADATA_LOADING_URI = "GRANT_METADATA_LOADING_URI";
export interface GrantMetadataLoadingURI {
  type: typeof GRANT_METADATA_LOADING_URI;
  id: string;
}

export const GRANT_METADATA_LOADING = "GRANT_METADATA_LOADING";
export interface GrantMetadataLoading {
  type: typeof GRANT_METADATA_LOADING;
  id: string;
}

export const GRANT_METADATA_FETCHED = "GRANT_METADATA_FETCHED";
export interface GrantMetadataFetched {
  type: typeof GRANT_METADATA_FETCHED;
  data: Metadata;
}

export const GRANT_METADATA_FETCHING_ERROR = "GRANT_METADATA_FETCHING_ERROR";
interface GrantMetadataFetchingError {
  type: typeof GRANT_METADATA_FETCHING_ERROR;
  id: string;
  error: string;
}

export const GRANT_METADATA_ALL_UNLOADED = "GRANT_METADATA_ALL_UNLOADED";
export interface GrantMetadataAllUnloadedAction {
  type: typeof GRANT_METADATA_ALL_UNLOADED;
}

export type GrantMetadataActions =
  | GrantMetadataLoadingURI
  | GrantMetadataLoading
  | GrantMetadataFetched
  | GrantMetadataFetchingError
  | GrantMetadataAllUnloadedAction;

export const grantMetadataLoadingURI = (id: string): GrantMetadataActions => ({
  type: GRANT_METADATA_LOADING_URI,
  id,
});

export const grantMetadataLoading = (id: string): GrantMetadataActions => ({
  type: GRANT_METADATA_LOADING,
  id,
});

export const grantMetadataFetched = (data: Metadata): GrantMetadataActions => ({
  type: GRANT_METADATA_FETCHED,
  data,
});

export const grantsMetadataAllUnloaded = (): GrantMetadataActions => ({
  type: GRANT_METADATA_ALL_UNLOADED,
});

export const grantMetadataFetchingError = (
  id: string,
  error: string
): GrantMetadataActions => ({
  type: GRANT_METADATA_FETCHING_ERROR,
  id,
  error,
});

const getProjectById = async (
  projectId: string,
  addresses: any,
  signerOrProvider: any
) => {
  const projectRegistry = new ethers.Contract(
    addresses.projectRegistry,
    ProjectRegistryABI,
    signerOrProvider
  );

  const { id } = getProjectURIComponents(projectId);
  const project: ProjectRegistryMetadata = await projectRegistry.projects(id);

  return project;
};

const getMetadata = async (
  projectId: string,
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
        datadogRum.addError(e);
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
    datadogRum.addError(e);
    console.error(e);
    return null;
  }

  try {
    metadata = JSON.parse(content);
  } catch (e) {
    // FIXME: dispatch JSON error
    datadogRum.addError(e);
    console.error(e);
    return null;
  }

  const ret = {
    ...metadata,
    protocol: project.metadata.protocol,
    pointer: project.metadata.pointer,
    id: projectId,
  };
  storage.add(cacheKey, JSON.stringify(ret));
  return ret;
};

export const fetchGrantData = (id: string) => async (dispatch: Dispatch) => {
  dispatch(grantMetadataLoadingURI(id));

  const { chainId, registryAddress } = getProjectURIComponents(id);

  const chainID = Number(chainId);
  const addresses = { projectRegistry: registryAddress };
  const appProvider = getProviderByChainId(chainID);

  let project: ProjectRegistryMetadata;

  try {
    project = await getProjectById(id, addresses, appProvider!);
  } catch (e) {
    datadogRum.addError(e);
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

  try {
    const cacheKey = `project-${id}-${project.metadata.protocol}-${project.metadata.pointer}`;
    const item = await getMetadata(id, project, cacheKey);

    if (item === null) {
      throw new Error();
    }

    dispatch(grantMetadataFetched(item));
  } catch (error) {
    console.log("item is null");
    dispatch(grantMetadataFetchingError(id, "error fetching metadata"));
  }
};

export const unloadAll = grantsMetadataAllUnloaded;
