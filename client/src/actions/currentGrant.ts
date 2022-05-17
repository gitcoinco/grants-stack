import { ethers } from "ethers";
import { Dispatch } from "redux";
import { RootState } from "../reducers";
import { MetaData } from "../types";
import { global } from "../global";
import { addressesByChainID } from "../contracts/deployments";
import GrantsRegistryABI from "../contracts/abis/GrantsRegistry.json";

export const CURRENT_GRANT_FETCHED = "CURRENT_GRANT_FETCHED";
export interface GrantFetched {
  type: typeof CURRENT_GRANT_FETCHED;
  data: MetaData;
}
export const CURRENT_GRANT_LOADING = "CURRENT_GRANT_LOADING";
export interface GrantLoading {
  type: typeof CURRENT_GRANT_LOADING;
  status: boolean;
}

export type CurrentGrantActions = GrantFetched | GrantLoading;
export const currentGrantFetched = (data: MetaData): CurrentGrantActions => ({
  type: CURRENT_GRANT_FETCHED,
  data,
});

export const currentGrantLoading = (status: boolean): CurrentGrantActions => ({
  type: CURRENT_GRANT_LOADING,
  status,
});

export const fetchGrantData =
  (id: number) => async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      dispatch(currentGrantLoading(true));
      const state = getState();
      const { chainID } = state.web3;
      const addresses = addressesByChainID(chainID!);
      const signer = global.web3Provider?.getSigner();

      const grantRegistry = new ethers.Contract(
        addresses.grantsRegistry,
        GrantsRegistryABI,
        signer
      );

      const grant: { metadata: string } = await grantRegistry.grants(
        Number(id)
      );

      const metaDataResponse = await fetch(grant.metadata);
      const metaDataValues: MetaData = await metaDataResponse.json();
      dispatch(currentGrantFetched(metaDataValues));
      dispatch(currentGrantLoading(false));
    } catch (e) {
      console.log({ e });
      dispatch(currentGrantLoading(false));
    }
  };
