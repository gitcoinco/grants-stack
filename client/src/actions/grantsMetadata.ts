import { ethers } from "ethers";
import { Dispatch } from "redux";
import { RootState } from "../reducers";
import { Metadata } from "../types";
import { global } from "../global";
import { addressesByChainID } from "../contracts/deployments";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";

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

    let grant: { metadata: string };
    try {
      grant = await projectRegistry.grants(id);
    } catch (e) {
      // FIXME: dispatch contract interaction error
      console.log(e);
      return;
    }

    if (grant === null) {
      // FIXME: dispatch "not found"
      console.error("grant not found");
      return;
    }

    const cachedMetadata = state.grantsMetadata[id]?.metadata;
    if (cachedMetadata !== undefined && cachedMetadata.uri === grant.metadata) {
      dispatch(grantMetadataFetched(cachedMetadata));
      return;
    }

    // FIXME: remove when grant metadata uri is saved without the full URL
    const matches = grant.metadata.match(/^https:\/\/ipfs.io\/ipfs\/(.+)$/);
    if (matches === null) {
      return;
    }

    const cid = matches[1];
    const chunks = [];

    dispatch(grantMetadataLoading(id));

    let source;
    try {
      source = await global.ipfs!.cat(cid);
    } catch (e) {
      // FIXME: dispatch "ipfs error"
      console.error(e);
      return;
    }

    const decoder = new TextDecoder();

    for await (const chunk of source) {
      chunks.push(decoder.decode(chunk));
    }

    const content = chunks.join("");

    let metadata: Metadata;
    try {
      metadata = JSON.parse(content);
    } catch (e) {
      // FIXME: dispatch JSON error
      console.error(e);
      return;
    }

    dispatch(
      grantMetadataFetched({
        ...metadata,
        uri: grant.metadata,
        id,
      })
    );
  };
