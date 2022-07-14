import { ethers } from "ethers";
import { Dispatch } from "redux";
import { global } from "../global";
import { RootState } from "../reducers";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { addressesByChainID } from "../contracts/deployments";
import { NewGrant, Status } from "../reducers/newGrant";
import PinataClient from "../services/pinata";

export const NEW_GRANT_STATUS = "NEW_GRANT_STATUS";
export interface NewGrantStatus {
  type: typeof NEW_GRANT_STATUS;
  status: Status;
  error: string | undefined;
}

export const NEW_GRANT_CREATED = "NEW_GRANT_CREATED";
export interface GrantCreated {
  type: typeof NEW_GRANT_CREATED;
  id: number;
  metaData: string;
  owner?: string;
}

export const RESET_STATUS = "RESET_STATUS";
export interface IPFSResetTXStatus {
  type: typeof RESET_STATUS;
}

export type NewGrantActions = GrantCreated | NewGrantStatus | IPFSResetTXStatus;

export const resetStatus = (): NewGrantActions => ({
  type: RESET_STATUS,
});

export const grantStatus = (
  status: Status,
  error: string | undefined
): NewGrantActions => ({
  type: NEW_GRANT_STATUS,
  status,
  error,
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
  (grantId: string | undefined, _content: any, image: Blob | undefined) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const content = _content;
    const pinataClient = new PinataClient();

    if (image !== undefined) {
      dispatch(grantStatus(Status.UploadingImage, undefined));
      const resp = await pinataClient.pinFile(image);
      content.projectImg = resp.IpfsHash;
    }

    dispatch(grantStatus(Status.UploadingJSON, undefined));
    const resp = await pinataClient.pinJSON(content);
    const metadataCID = resp.IpfsHash;

    const state = getState();
    const { chainID } = state.web3;
    const addresses = addressesByChainID(chainID!);
    const signer = global.web3Provider?.getSigner();
    const projectRegistry = new ethers.Contract(
      addresses.projectRegistry,
      ProjectRegistryABI,
      signer
    );

    dispatch(grantStatus(Status.WaitingForSignature, undefined));
    let projectTx;

    if (grantId !== undefined) {
      try {
        projectTx = await projectRegistry.updateProjectMetaData(grantId, {
          protocol: 1,
          pointer: metadataCID,
        });
      } catch (e) {
        dispatch(grantStatus(Status.Error, "transaction error"));
        console.error("tx error", e);
        return;
      }
    } else {
      try {
        projectTx = await projectRegistry.createProject({
          protocol: 1,
          pointer: metadataCID,
        });
      } catch (e) {
        dispatch(grantStatus(Status.Error, "transaction error"));
        console.error("tx error", e);
        return;
      }
    }

    dispatch(grantStatus(Status.TransactionInitiated, undefined));
    const txStatus = await projectTx.wait();
    if (txStatus.status) {
      dispatch(grantStatus(Status.Completed, undefined));
    }
  };
