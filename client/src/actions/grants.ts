import { Dispatch } from "redux";
import { RootState } from "../reducers";
import GrantsRegistryABI from "../contracts/abis/GrantsRegistry.json";
import { global } from "../global";
import { ethers, BigNumber } from "ethers";
import { addressesByChainID } from "../contracts/deployments";

export const GRANTS_LOADING = "GRANTS_LOADING";
export interface GrantsLoadingAction {
  type: typeof GRANTS_LOADING;
}

export const GRANTS_LOADED = "GRANTS_LOADED";
export interface GrantsLoadedAction {
  type: typeof GRANTS_LOADED;
  grants: number[];
}

export const GRANTS_UNLOADED = "GRANTS_UNLOADED";
export interface GrantsUnloadedAction {
  type: typeof GRANTS_UNLOADED;
}

export type GrantsActions =
  | GrantsLoadingAction
  | GrantsLoadedAction
  | GrantsUnloadedAction;

const grantsLoading = () => ({
  type: GRANTS_LOADING,
});

const grantsLoaded = (grants: number[]) => ({
  type: GRANTS_LOADED,
  grants,
});

const grantsUnload = () => ({
  type: GRANTS_UNLOADED,
});

export const loadGrants = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(grantsLoading());

    const state = getState();
    const chainID = state.web3.chainID;

    const addresses = addressesByChainID(chainID!);
    const signer = global.web3Provider!.getSigner();
    const contract = new ethers.Contract(
      addresses.grantsRegistry,
      GrantsRegistryABI,
      signer
    );

    const filter = contract.filters.GrantCreated(state.web3.account);
    const res = await contract.queryFilter(filter);
    const uris = res.map((x: any) => BigNumber.from(x.args.grantId).toNumber());
    dispatch(grantsLoaded(uris));
  };
};

export const unloadGrants = () => {
  return grantsUnload();
};
