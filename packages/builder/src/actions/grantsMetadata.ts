import { DataLayer } from "data-layer";
import { datadogRum } from "@datadog/browser-rum";
import { Dispatch } from "redux";
import { RootState } from "../reducers";
import { Metadata } from "../types";
import { getProjectURIComponents, getV1HashedProjectId } from "../utils/utils";

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

export const fetchGrantData =
  (id: string, dataLayer: DataLayer) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(grantMetadataLoadingURI(id));

    const { chainId } = getProjectURIComponents(id);

    try {
      const result = await dataLayer.getProjectById({
        projectId: getV1HashedProjectId(id), // todo: v2? => v2 project id
        chainId: Number(chainId),
        alloVersion: "allo-v1", // todo: update hardcoded versions to getConfig
      });

      if (!result?.project) {
        return;
      }

      const { project } = result;

      console.log(getState());

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
      };

      if (item === null) {
        throw new Error("item is null");
      }

      console.log("item", item);

      dispatch(grantMetadataFetched(item));
    } catch (e) {
      datadogRum.addError(e);
      console.error("error fetching project by id", e);
      dispatch(grantMetadataFetchingError(id, "error fetching project by id"));
    }
  };

export const unloadAll = grantsMetadataAllUnloaded;
