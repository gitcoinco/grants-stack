import {
  Dispatch,
} from 'redux';
import { RootState } from '../reducers';
import GrantNFTABI from "../contracts/abis/GrantNFT.json";
import { global } from "../global";
import { ethers } from "ethers";
import { Rinkeby } from "../contracts/deployments";

export const GRANTS_LOADING = "GRANTS_LOADING";
export interface GrantsLoadingAction {
  type: typeof GRANTS_LOADING
}

export const GRANTS_LOADED = "GRANTS_LOADED";
export interface GrantsLoadedAction {
  type: typeof GRANTS_LOADED
  grantsURIs: string[]
}

export const GRANTS_UNLOADED = "GRANTS_UNLOADED";
export interface GrantsUnloadedAction {
  type: typeof GRANTS_UNLOADED
}

export type GrantsActions =
  GrantsLoadingAction |
  GrantsLoadedAction |
  GrantsUnloadedAction;

const grantsLoading = () => ({
  type: GRANTS_LOADING
});

const grantsLoaded = (grantsURIs: string[]) => ({
  type: GRANTS_LOADED,
  grantsURIs
});

const grantsUnload = () => ({
  type: GRANTS_UNLOADED
});

export const loadGrants = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(grantsLoading());
    const signer = global.web3Provider!.getSigner();
    const contract = new ethers.Contract(Rinkeby.grantNft, GrantNFTABI.abi, signer);
    const filter = contract.filters.GrantCreated(null, null, null);
    // FIXME: filter by grant owner
    const res = await contract.queryFilter(filter);
    const uris = res.map((x: any) => x.args.tokenURI);
    dispatch(grantsLoaded(uris));
  };
};

export const unloadGrants = () => {
  return grantsUnload();
}
