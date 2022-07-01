import { ethers } from "ethers";
import { Dispatch } from "redux";
import { global } from "../global";
import { RootState } from "../reducers";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
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

export const RESET_TX_STATUS = "RESET_TX_STATUS";
export interface IPFSResetTXStatus {
  type: typeof RESET_TX_STATUS;
}

export type NewGrantActions =
  | GrantCreated
  | NewGrantTXStatus
  | IPFSResetTXStatus;

export const resetTXStatus = (): NewGrantActions => ({
  type: RESET_TX_STATUS,
});

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

export const publishGrant =
  (grantId?: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const { chainID } = state.web3;
      const addresses = addressesByChainID(chainID!);
      const signer = global.web3Provider?.getSigner();
      const projectRegistry = new ethers.Contract(
        addresses.projectRegistry,
        ProjectRegistryABI,
        signer
      );
      let projectTx;
      if (grantId !== undefined) {
        projectTx = await projectRegistry.updateProjectMetadata(grantId, {
          protocol: 1,
          pointer: state.ipfs.projectFileSavedCID,
        });
      } else {
        projectTx = await projectRegistry.createProject(signer?.getAddress(), {
          protocol: 1,
          pointer: state.ipfs.projectFileSavedCID,
        });
      }

      dispatch(grantTXStatus("initiated"));
      const txStatus = await projectTx.wait();
      if (txStatus.status) {
        dispatch(grantTXStatus("complete"));
      }
    } catch (e) {
      console.log({ e });
      dispatch(grantTXStatus("error"));
    }
  };
