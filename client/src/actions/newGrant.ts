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
import { unloadAll as unloadAllMetadata } from "./grantsMetadata";
import { unloadProjects } from "./projects";

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
  (grantId?: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const { metadata: formMetaData, credentials: formCredentials } =
      state.projectForm;

    if (formMetaData === undefined) {
      return;
    }
    const application = {
      ...formMetaData,
    } as Project;

    const pinataClient = new PinataClient();
    dispatch(grantStatus(Status.UploadingImages));
    if (formMetaData?.bannerImgData !== undefined) {
      const resp = await pinataClient.pinFile(formMetaData.bannerImgData);
      application.bannerImg = resp.IpfsHash;
    }

    if (formMetaData?.logoImgData !== undefined) {
      const resp = await pinataClient.pinFile(formMetaData.logoImgData);
      application.logoImg = resp.IpfsHash;
    }

    application.credentials = formCredentials;
    application.createdAt = Date.now();

    dispatch(grantStatus(Status.UploadingJSON));
    const resp = await pinataClient.pinJSON(application);
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
          dispatch(grantError("transaction error", Status.Error));
          console.error("tx error", e);
          return;
        }
      }
    } catch (e) {
      datadogRum.addError(e);
      dispatch(grantError("transaction error", Status.Error));
      console.error("tx error", e);
      return;
    }

    dispatch(grantStatus(Status.TransactionInitiated));
    const txStatus = await projectTx.wait();

    // unload projects before changing the status
    // so that if the component redirects to the dashboard
    // we are sure to reload the updated or created project
    dispatch(unloadAllMetadata());
    dispatch(unloadProjects());

    if (txStatus.status) {
      dispatch(grantStatus(Status.Completed));
    }
  };
