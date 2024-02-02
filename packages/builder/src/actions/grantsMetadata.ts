import { datadogRum } from "@datadog/browser-rum";
import { getConfig } from "common/src/config";
import { AddressAndRole, DataLayer } from "data-layer";
import { Dispatch } from "redux";
import { Metadata } from "../types";
import { getProjectURIComponents, getV1HashedProjectId } from "../utils/utils";
import { projectOwnersLoaded } from "./projects";

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
    const { chainId } = getProjectURIComponents(id);
    const projectId = id.split(":")[2];

    try {
      const result = await dataLayer.getProjectById({
        projectId:
          config.allo.version === "allo-v1"
            ? getV1HashedProjectId(id)
            : projectId,
        chainId: Number(chainId),
        alloVersion: config.allo.version,
      });

      if (!result?.project) {
        return;
      }

      const { project } = result;

      const item: Metadata = {
        id,
        title: project.metadata.title,
        description: project.metadata.description,
        website: project.metadata.website,
        bannerImg: project.metadata.bannerImg,
        logoImg: project.metadata.logoImg,
        createdAt: project.metadata.createdAt,
        updatedAt: project.metadata.createdAt, // todo: get this value
        credentials: project.metadata.credentials,
        protocol: 1,
        pointer: project.metadataCid,
        userGithub: project.metadata.userGithub,
        projectGithub: project.metadata.projectGithub,
        projectTwitter: project.metadata.projectTwitter,
      };

      const ownerAddresses = project.roles
        .filter((role: AddressAndRole) => role.role === "OWNER")
        .map((role) => role.address);

      dispatch(projectOwnersLoaded(id, ownerAddresses));

      dispatch(grantMetadataFetched(item));
    } catch (e) {
      datadogRum.addError(e);
      console.error("error fetching project by id", e);
      dispatch(grantMetadataFetchingError(id, "error fetching project by id"));
    }
  };

export const unloadAll = grantsMetadataAllUnloaded;
