import { datadogRum } from "@datadog/browser-rum";
import { getConfig } from "common/src/config";
import { AddressAndRole, DataLayer, v2Project } from "data-layer";
import { ethers } from "ethers";
import { Dispatch } from "redux";
import { Metadata } from "../types";
import { projectAnchorsLoaded, projectOwnersLoaded } from "./projects";

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

export const transformAndDispatchProject =
  (id: string, project: v2Project) => async (dispatch: Dispatch) => {
    const item: Metadata = {
      id,
      title: project.metadata.title,
      description: project.metadata.description,
      website: project.metadata.website,
      bannerImg: project.metadata.bannerImg,
      logoImg: project.metadata.logoImg,
      createdAt: project.metadata.createdAt,
      updatedAt: project.metadata.createdAt,
      credentials: project.metadata.credentials,
      protocol: project.metadata.protocol,
      pointer: project.metadataCid,
      userGithub: project.metadata.userGithub,
      projectGithub: project.metadata.projectGithub,
      projectTwitter: project.metadata.projectTwitter,
      chainId: project.chainId,
      linkedChains: project.linkedChains,
      nonce: project.nonce,
      registryAddress: project.registryAddress,
      projectNumber: project.projectNumber,
    };

    // todo: should we lowercase the owner addresses?
    const ownerAddresses: `0x${string}`[] = project.roles
      .filter((role: AddressAndRole) => role.role === "OWNER")
      .map((role) => ethers.utils.getAddress(role.address));

    dispatch(projectOwnersLoaded(id, ownerAddresses));

    const anchorAddress = project.anchorAddress!;
    dispatch(projectAnchorsLoaded(id, anchorAddress));

    dispatch(grantMetadataFetched(item));
  };

/**
 * Fetches the data for a project
 *
 * @remarks
 *
 * This function is a thunk action creator. It fetches the data for a project and dispatches the
 * appropriate actions to the store.
 *
 * @param id
 * @param dataLayer
 *
 * @returns The data for a project
 */
export const fetchGrantData =
  (id: string, dataLayer: DataLayer) => async (dispatch: Dispatch) => {
    dispatch(grantMetadataLoadingURI(id));
    const config = getConfig();

    try {
      const result = await dataLayer.getProjectById({
        projectId: id,
        alloVersion: config.allo.version,
      });

      if (!result?.project) {
        return;
      }

      const { project } = result;

      dispatch<any>(transformAndDispatchProject(id, project));
    } catch (e) {
      datadogRum.addError(e);
      console.error("error fetching project by id", e);
      dispatch(grantMetadataFetchingError(id, "error fetching project by id"));
    }
  };

export const unloadAll = grantsMetadataAllUnloaded;
