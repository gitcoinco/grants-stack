import { ethers } from "ethers";
import { Dispatch } from "redux";
import { RootState } from "../reducers";
import { Metadata } from "../types";
import { global } from "../global";
import { addressesByChainID } from "../contracts/deployments";
import GrantsRegistryABI from "../contracts/abis/GrantsRegistry.json";

export const CURRENT_GRANT_FETCHED = "CURRENT_GRANT_FETCHED";
export interface GrantFetched {
  type: typeof CURRENT_GRANT_FETCHED;
  data: Metadata;
}
export const CURRENT_GRANT_LOADING = "CURRENT_GRANT_LOADING";
export interface GrantLoading {
  type: typeof CURRENT_GRANT_LOADING;
  status: boolean;
}

export type CurrentGrantActions = GrantFetched | GrantLoading;
export const currentGrantFetched = (data: Metadata): CurrentGrantActions => ({
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

      const grant: { metadata: string } = await grantRegistry.grants(id);
      if (grant === null) {
        // FIXME: dispatch "not found"
        return;
      }

      const matches = grant.metadata.match(/^https:\/\/ipfs.io\/ipfs\/(.+)$/);
      if (matches === null) {
        return;
      }

      const cid = matches[1];
      console.log("fetching", cid);

      const chunks = [];
      const source = await global.ipfs!.cat(cid);
      const decoder = new TextDecoder();

      for await (const chunk of source) {
        chunks.push(decoder.decode(chunk));
      }

      const content = chunks.join("");
      const metadata: Metadata = JSON.parse(content);
      dispatch(currentGrantFetched(metadata));
    } catch (e) {
      // FIXME: dispatch an error to show in the UI
      console.log({ e });
      dispatch(currentGrantLoading(false));
    }
  };
