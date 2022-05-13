import { ethers } from "ethers";
import { global } from "../global";
import { Dispatch } from "redux";
import { RootState } from "../reducers";
import GrantsRegistryABI from "../contracts/abis/GrantsRegistry.json";
import { addressesByChainID } from "../contracts/deployments";
import { NewGrant } from "../reducers/newGrant";

export const NEW_GRANT_TX_STATUS = "NEW_GRANT_TX_STATUS";
export interface NewGrantTXStatus {
  type: typeof NEW_GRANT_TX_STATUS;
  status: string;
}

export const NEW_GRANT_CREATED = "NEW_GRANT_CREATED";
export interface GrantCreated {
  type: typeof NEW_GRANT_CREATED;
  id: number;
  metaData: string;
  owner?: string;
}

export type NewGrantActions = GrantCreated | NewGrantTXStatus;

export const grantTXStatus = (status: string): NewGrantActions => ({
  type: NEW_GRANT_TX_STATUS,
  status,
});

export const grantCreated = ({
  id,
  metaData,
  owner,
}: NewGrant): NewGrantActions => ({
  type: NEW_GRANT_CREATED,
  id,
  metaData,
  owner,
});

export const createGrant = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const chainID = state.web3.chainID;
    const addresses = addressesByChainID(chainID!);
    const signer = global.web3Provider?.getSigner();
    const grantRegistry = new ethers.Contract(
      addresses.grantsRegistry,
      GrantsRegistryABI,
      signer
    );
    if (state.ipfs.lastFileSavedURL) {
      const creationTx = await grantRegistry.createGrant(
        state.web3.account,
        state.ipfs.lastFileSavedURL,
        state.web3.account
      );
      dispatch(grantTXStatus("initiated"));
      const txStatus = await creationTx.wait();
      if (txStatus.status) {
        dispatch(grantTXStatus("complete"));
      } else {
        throw Error("Unable to create grant");
      }
    }
  };
};
