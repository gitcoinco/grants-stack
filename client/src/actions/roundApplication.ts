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
import { metadataToProject } from "../utils/utils";
import { getRoundProjectsApplied } from "./projects";

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

export type RoundApplicationActions =
  | RoundApplicationLoadingAction
  | RoundApplicationErrorAction
  | RoundApplicationErrorResetAction
  | RoundApplicationLoadedAction
  | RoundApplicationFoundAction
  | RoundApplicationNotFoundAction
  | RoundApplicationResetAction;

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
      dispatch(
        applicationError(
          roundAddress,
          "cannot load round data",
          Status.BuildingApplication
        )
      );
      return;
    }

    const roundApplicationMetadata = roundState.round?.applicationMetadata;
    if (roundApplicationMetadata === undefined) {
      dispatch(
        applicationError(
          roundAddress,
          "cannot load round application metadata",
          Status.BuildingApplication
        )
      );
      return;
    }

    const { projectQuestionId } = roundApplicationMetadata;
    if (projectQuestionId === undefined) {
      dispatch(
        applicationError(
          roundAddress,
          "cannot find project question id",
          Status.BuildingApplication
        )
      );
      return;
    }

    const projectId = formInputs[projectQuestionId];
    const projectMetadata: any =
      state.grantsMetadata[Number(projectId)].metadata;
    if (projectMetadata === undefined) {
      dispatch(
        applicationError(
          roundAddress,
          "cannot find selected project metadata",
          Status.BuildingApplication
        )
      );
      return;
    }

    const project: Project = metadataToProject(projectMetadata, 0);

    const { chainID } = state.web3;
    const chainName = chains[chainID!];
    if (chainID === undefined) {
      dispatch(
        applicationError(
          roundAddress,
          "cannot find chain name",
          Status.BuildingApplication
        )
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
        chainName
      );
      application = await builder.build(roundAddress, formInputs);

      deterministicApplication = objectToDeterministicJSON(application as any);
    } catch (error) {
      dispatch(
        applicationError(
          roundAddress,
          "cannot authenticate user",
          Status.LitAuthentication
        )
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
      datadogRum.addError(e);
      dispatch(
        applicationError(
          roundAddress,
          "error signing round application",
          Status.SigningApplication
        )
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

    const resp = await pinataClient.pinJSON(signedApplication);
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
      chainID,
      Number(projectId)
    );

    try {
      const tx = await contract.applyToRound(projectUniqueID, metaPtr);
      // FIXME: check return value of tx.wait() ??
      await tx.wait();
      dispatch({
        type: ROUND_APPLICATION_LOADED,
        roundAddress,
        projectId: Number(projectId),
      });
      dispatch<any>(getRoundProjectsApplied(projectUniqueID, chainID));
    } catch (e) {
      datadogRum.addError(e);
      console.error("error calling applyToRound:", e);
      dispatch(
        applicationError(
          roundAddress,
          "error calling applyToRound",
          Status.SendingTx
        )
      );
    }
  };

export const checkRoundApplications =
  (chainID: number, roundAddress: string, projectIDs: Array<number>) =>
  async (dispatch: Dispatch) => {
    const { signer } = global;
    const contract = new ethers.Contract(roundAddress, RoundABI, signer);
    const uniqueIDsToIDs = Object.fromEntries(
      projectIDs.map((id: number) => [
        generateUniqueRoundApplicationID(chainID, id),
        id,
      ])
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
