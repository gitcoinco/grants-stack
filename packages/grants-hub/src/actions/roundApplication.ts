import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { ethers } from "ethers";
import { Dispatch } from "redux";
import RoundABI from "../contracts/abis/RoundImplementation.json";
import { chains } from "../contracts/deployments";
import { global } from "../global";
import { RootState } from "../reducers";
import { Status } from "../reducers/roundApplication";
import PinataClient from "../services/pinata";
import { Project, RoundApplication, SignedRoundApplication } from "../types";
import { objectToDeterministicJSON } from "../utils/deterministicJSON";
import generateUniqueRoundApplicationID from "../utils/roundApplication";
import RoundApplicationBuilder from "../utils/RoundApplicationBuilder";
import { getProjectURIComponents, metadataToProject } from "../utils/utils";
import { fetchProjectApplications } from "./projects";

// FIXME: rename to ROUND_APPLICATION_APPLYING
export const ROUND_APPLICATION_LOADING = "ROUND_APPLICATION_LOADING";
interface RoundApplicationLoadingAction {
  type: typeof ROUND_APPLICATION_LOADING;
  roundAddress: string;
  status: Status;
}

export const ROUND_APPLICATION_ERROR = "ROUND_APPLICATION_ERROR";
interface RoundApplicationErrorAction {
  type: typeof ROUND_APPLICATION_ERROR;
  roundAddress: string;
  error: string;
  step: Status;
}

export const ROUND_APPLICATION_ERROR_RESET = "ROUND_APPLICATION_ERROR_RESET";
interface RoundApplicationErrorResetAction {
  type: typeof ROUND_APPLICATION_ERROR_RESET;
  roundAddress: string;
}

// FIXME: rename to ROUND_APPLICATION_APPLIED
export const ROUND_APPLICATION_LOADED = "ROUND_APPLICATION_LOADED";
interface RoundApplicationLoadedAction {
  type: typeof ROUND_APPLICATION_LOADED;
  roundAddress: string;
  projectId: number;
}

export const ROUND_APPLICATION_FOUND = "ROUND_APPLICATION_FOUND";
interface RoundApplicationFoundAction {
  type: typeof ROUND_APPLICATION_FOUND;
  roundAddress: string;
  projectID: number;
}

export const ROUND_APPLICATION_NOT_FOUND = "ROUND_APPLICATION_NOT_FOUND";
interface RoundApplicationNotFoundAction {
  type: typeof ROUND_APPLICATION_NOT_FOUND;
  roundAddress: string;
}

export const ROUND_APPLICATION_RESET = "ROUND_APPLICATION_RESET";
interface RoundApplicationResetAction {
  type: typeof ROUND_APPLICATION_RESET;
  roundAddress: string;
}

export const APPLICATION_DATA_ERROR = "APPLICATION_DATA_ERROR";

interface ApplicationDataErrorAction {
  type: typeof APPLICATION_DATA_ERROR;
  error: string;
}

export const APPLICATION_DATA_LOADED = "APPLICATION_DATA_LOADED";

interface ApplicationDataLoadedAction {
  type: typeof APPLICATION_DATA_LOADED;
  roundAddress: string;
  applicationData: SignedRoundApplication;
  ipfsHash: string;
}

export type RoundApplicationActions =
  | RoundApplicationLoadingAction
  | RoundApplicationErrorAction
  | RoundApplicationErrorResetAction
  | RoundApplicationLoadedAction
  | RoundApplicationFoundAction
  | RoundApplicationNotFoundAction
  | RoundApplicationResetAction
  | ApplicationDataErrorAction
  | ApplicationDataLoadedAction;

const applicationError = (
  roundAddress: string,
  error: string,
  step: Status
): RoundApplicationActions => ({
  type: ROUND_APPLICATION_ERROR,
  roundAddress,
  error,
  step,
});

export const resetApplication = (roundAddress: string) => ({
  type: ROUND_APPLICATION_RESET,
  roundAddress,
});

export const resetApplicationError = (roundAddress: string) => ({
  type: ROUND_APPLICATION_ERROR_RESET,
  roundAddress,
});

// This should be made more generic and refactored out in the future
const dispatchAndLogApplicationError = (
  dispatch: Dispatch,
  roundAddress: string,
  error: string,
  step: Status
) => {
  datadogRum.addError(new Error(error), {
    roundAddress,
  });
  datadogLogs.logger.error(error, {
    roundAddress,
  });
  dispatch(applicationError(roundAddress, error, step));
};

export const submitApplication =
  (roundAddress: string, formInputs: { [id: number]: string }) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const roundState = state.rounds[roundAddress];

    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundAddress,
      status: Status.BuildingApplication,
    });

    if (roundState === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "cannot load round data",
        Status.BuildingApplication
      );
      return;
    }

    const roundApplicationMetadata = roundState.round?.applicationMetadata;
    if (roundApplicationMetadata === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "cannot load round application metadata",
        Status.BuildingApplication
      );
      return;
    }

    const { projectQuestionId } = roundApplicationMetadata;
    if (projectQuestionId === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "cannot find project question id",
        Status.BuildingApplication
      );
      return;
    }

    const projectID = formInputs[projectQuestionId];
    const {
      id: projectNumber,
      registryAddress: projectRegistryAddress,
      chainId: projectChainId,
    } = getProjectURIComponents(projectID);

    const projectMetadata: any = state.grantsMetadata[projectID].metadata;
    if (projectMetadata === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "cannot find selected project metadata",
        Status.BuildingApplication
      );
      return;
    }

    const project: Project = metadataToProject(projectMetadata, 0);

    const { chainID } = state.web3;
    const chainName = chains[chainID!];
    if (chainID === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "cannot find chain id",
        Status.BuildingApplication
      );
      return;
    }

    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundAddress,
      status: Status.LitAuthentication,
    });

    let application: RoundApplication;
    let deterministicApplication: string;

    try {
      const builder = new RoundApplicationBuilder(
        true,
        project,
        roundApplicationMetadata,
        roundAddress,
        chainName === "mainnet" ? "ethereum" : chainName // lit wants "ethereum" for mainnet
      );

      application = await builder.build(roundAddress, formInputs);

      deterministicApplication = objectToDeterministicJSON(application as any);
    } catch (error) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "error building round application",
        Status.LitAuthentication
      );
      return;
    }

    const { signer } = global;

    const hash = ethers.utils.solidityKeccak256(
      ["string"],
      [deterministicApplication]
    );

    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundAddress,
      status: Status.SigningApplication,
    });

    let signature: string;
    try {
      signature = await signer.signMessage(hash);
    } catch (e) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "error signing round application",
        Status.SigningApplication
      );
      return;
    }

    const signedApplication: SignedRoundApplication = {
      signature,
      application,
    };

    const pinataClient = new PinataClient();
    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundAddress,
      status: Status.UploadingMetadata,
    });

    let resp;
    try {
      resp = await pinataClient.pinJSON(signedApplication);
    } catch (e) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "error uploading round application metadata",
        Status.UploadingMetadata
      );
      return;
    }
    const metaPtr = {
      protocol: "1",
      pointer: resp.IpfsHash,
    };
    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundAddress,
      status: Status.SendingTx,
    });

    const contract = new ethers.Contract(roundAddress, RoundABI, signer);

    const projectUniqueID = generateUniqueRoundApplicationID(
      Number(projectChainId),
      projectNumber,
      projectRegistryAddress
    );

    try {
      const tx = await contract.applyToRound(projectUniqueID, metaPtr);
      // FIXME: check return value of tx.wait() ??
      await tx.wait();
      dispatch({
        type: ROUND_APPLICATION_LOADED,
        roundAddress,
        projectId: projectID,
      });
      dispatch<any>(
        fetchProjectApplications(projectID, Number(projectChainId), process.env)
      );
    } catch (e: any) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "error calling applyToRound",
        Status.SendingTx
      );
    }
  };

export const checkRoundApplications =
  (chainID: number, roundAddress: string, projectIDs: Array<string>) =>
  async (dispatch: Dispatch) => {
    const { signer } = global;
    const contract = new ethers.Contract(roundAddress, RoundABI, signer);
    const uniqueIDsToIDs = Object.fromEntries(
      projectIDs.map((fullId: string) => {
        const {
          id,
          registryAddress,
          chainId: projectChainId,
        } = getProjectURIComponents(fullId);
        return [
          generateUniqueRoundApplicationID(
            Number(projectChainId),
            id,
            registryAddress
          ),
          id,
        ];
      })
    );

    const applicationFilter = contract.filters.NewProjectApplication(
      Object.keys(uniqueIDsToIDs)
    );

    let applicationEvents = [];
    try {
      applicationEvents = await contract.queryFilter(applicationFilter);
      applicationEvents.forEach((event) => {
        const projectID = uniqueIDsToIDs[event?.args?.project];
        if (projectID !== undefined) {
          dispatch({
            type: ROUND_APPLICATION_FOUND,
            roundAddress,
            projectID,
          });
        }
      });
    } catch (e) {
      // FIXME: dispatch an error?
      datadogLogs.logger.warn("error getting round applications");
      datadogRum.addError(e);
      console.error("error getting round applications");
    } finally {
      if (applicationEvents.length === 0) {
        dispatch({
          type: ROUND_APPLICATION_NOT_FOUND,
          roundAddress,
        });
      }
    }
  };

export const fetchApplicationData =
  (ipfsHash: string, roundAddress: string) => async (dispatch: Dispatch) => {
    const pinataClient = new PinataClient();
    try {
      const resp = await pinataClient.fetchJson(ipfsHash);
      dispatch({
        type: APPLICATION_DATA_LOADED,
        applicationData: resp,
        roundAddress,
        ipfsHash,
      });
    } catch (e) {
      dispatch({
        type: APPLICATION_DATA_ERROR,
      });
    }
  };
