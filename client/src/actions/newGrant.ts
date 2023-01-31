import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { ethers } from "ethers";
import { Dispatch } from "redux";
import ProjectRegistryABI from "../contracts/abis/ProjectRegistry.json";
import { addressesByChainID } from "../contracts/deployments";
import { global } from "../global";
import { RootState } from "../reducers";
import { NewGrant, Status } from "../reducers/newGrant";
import PinataClient from "../services/pinata";
import { Project } from "../types/index";
import { getProjectURIComponents } from "../utils/utils";

export const NEW_GRANT_STATUS = "NEW_GRANT_STATUS";
export interface NewGrantStatus {
  type: typeof NEW_GRANT_STATUS;
  status: Status;
}

export const NEW_GRANT_CREATED = "NEW_GRANT_CREATED";
export interface GrantCreated {
  type: typeof NEW_GRANT_CREATED;
  id: number;
  metaData: string;
  owner?: string;
}

export const NEW_GRANT_ERROR = "NEW_GRANT_ERROR";
export interface GrantError {
  type: typeof NEW_GRANT_ERROR;
  step: Status;
  error: string;
}

export const RESET_STATUS = "RESET_STATUS";
export interface IPFSResetTXStatus {
  type: typeof RESET_STATUS;
}

export type NewGrantActions = GrantCreated | NewGrantStatus | IPFSResetTXStatus;

export const resetStatus = (): NewGrantActions => ({
  type: RESET_STATUS,
});

export const grantStatus = (status: Status): NewGrantActions => ({
  type: NEW_GRANT_STATUS,
  status,
});

export const grantError = (error: string, step: Status): GrantError => ({
  type: NEW_GRANT_ERROR,
  error,
  step,
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
  (fullId?: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const { metadata: formMetaData, credentials: formCredentials } =
      state.projectForm;

    const { id: grantId } = fullId
      ? getProjectURIComponents(fullId)
      : { id: undefined };

    const oldGrantMetadata = state.grantsMetadata[fullId || ""];

    if (formMetaData === undefined) {
      return;
    }
    const application = {
      ...formMetaData,
    } as Project;

    const pinataClient = new PinataClient();
    dispatch(grantStatus(Status.UploadingImages));
    if (formMetaData?.bannerImgData !== undefined) {
      try {
        const resp = await pinataClient.pinFile(formMetaData.bannerImgData);
        application.bannerImg = resp.IpfsHash;
      } catch {
        datadogRum.addError("ipfs: error uploading banner image");
        datadogLogs.logger.error("ipfs: error uploading banner image");
      }
    }

    if (formMetaData?.logoImgData !== undefined) {
      try {
        const resp = await pinataClient.pinFile(formMetaData.logoImgData);
        application.logoImg = resp.IpfsHash;
      } catch (e) {
        datadogRum.addError(e);
        datadogLogs.logger.error("ipfs: error uploading logo image");
        console.log("ipfs: error uploading logo image", e);
      }
    }
    application.credentials = formCredentials;
    application.createdAt = oldGrantMetadata
      ? oldGrantMetadata.metadata?.createdAt
      : Date.now();

    dispatch(grantStatus(Status.UploadingJSON));
    let resp;
    try {
      resp = await pinataClient.pinJSON(application);
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error("ipfs: error uploading metadata");
      console.error("ipfs: error uploading metadata", e);
    }

    const metadataCID = resp.IpfsHash;
    const { chainID } = state.web3;
    const addresses = addressesByChainID(chainID!);
    const { signer } = global;
    const projectRegistry = new ethers.Contract(
      addresses.projectRegistry,
      ProjectRegistryABI,
      signer
    );

    dispatch(grantStatus(Status.WaitingForSignature));
    let projectTx;
    try {
      if (grantId !== undefined) {
        try {
          projectTx = await projectRegistry.updateProjectMetadata(grantId, {
            protocol: 1,
            pointer: metadataCID,
          });
        } catch (e) {
          datadogRum.addError(e);
          datadogLogs.logger.warn("transaction error");
          dispatch(grantError("transaction error", Status.Error));
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
          datadogRum.addError(e);
          datadogLogs.logger.warn("transaction error");
          dispatch(grantError("transaction error", Status.Error));
          console.error("tx error", e);
          return;
        }
      }
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.warn("transaction error");
      dispatch(grantError("transaction error", Status.Error));
      console.error("tx error", e);
      return;
    }

    dispatch(grantStatus(Status.TransactionInitiated));
    const txStatus = await projectTx.wait();

    if (txStatus.status) {
      dispatch(grantStatus(Status.Completed));
    }
  };
