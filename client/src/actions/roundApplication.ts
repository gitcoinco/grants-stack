import { Dispatch } from "redux";
import { ethers } from "ethers";
import { Status } from "../reducers/roundApplication";
import { RootState } from "../reducers";
import RoundApplicationBuilder from "../utils/RoundApplicationBuilder";
import { Project, RoundApplication, SignedRoundApplication } from "../types";
import PinataClient from "../services/pinata";
import RoundABI from "../contracts/abis/Round.json";
import { global } from "../global";
import { chains } from "../contracts/deployments";
import generateUniqueRoundApplicationID from "../utils/roundApplication";
import { objectToDeterministicJSON } from "../utils/deterministicJSON";
import { metadataToProject } from "../utils/utils";

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
}

// FIXME: rename to ROUND_APPLICATION_APPLIED
export const ROUND_APPLICATION_LOADED = "ROUND_APPLICATION_LOADED";
interface RoundApplicationLoadedAction {
  type: typeof ROUND_APPLICATION_LOADED;
  roundAddress: string;
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

export type RoundApplicationActions =
  | RoundApplicationLoadingAction
  | RoundApplicationErrorAction
  | RoundApplicationLoadedAction
  | RoundApplicationFoundAction
  | RoundApplicationNotFoundAction;

const applicationError = (
  roundAddress: string,
  error: string
): RoundApplicationActions => ({
  type: ROUND_APPLICATION_ERROR,
  roundAddress,
  error,
});

export const submitApplication =
  (roundAddress: string, formInputs: { [id: number]: string }) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundAddress,
      status: Status.BuildingApplication,
    });

    const state = getState();
    const roundState = state.rounds[roundAddress];
    if (roundState === undefined) {
      dispatch(applicationError(roundAddress, "cannot load round data"));
      return;
    }

    const roundApplicationMetadata = roundState.round?.applicationMetadata;
    if (roundApplicationMetadata === undefined) {
      dispatch(
        applicationError(roundAddress, "cannot load round application metadata")
      );
      return;
    }

    const { projectQuestionId } = roundApplicationMetadata;
    if (projectQuestionId === undefined) {
      dispatch(
        applicationError(roundAddress, "cannot find project question id")
      );
      return;
    }

    const projectId = formInputs[projectQuestionId];
    const projectMetadata: any =
      state.grantsMetadata[Number(projectId)].metadata;
    if (projectMetadata === undefined) {
      dispatch(
        applicationError(roundAddress, "cannot find selected project metadata")
      );
      return;
    }

    const project: Project = metadataToProject(projectMetadata, 0);

    // FIXME: this is temporarily until the round manager adds the encrypted field
    roundApplicationMetadata.applicationSchema.forEach((question) => {
      if (/email|cool/i.test(question.question.toLowerCase())) {
        // eslint-disable-next-line
        question.encrypted = true;
      }
    });

    const { chainID } = state.web3;
    const chainName = chains[chainID!];
    if (chainID === undefined) {
      dispatch(applicationError(roundAddress, "cannot find chain name"));
      return;
    }

    const builder = new RoundApplicationBuilder(
      true,
      project,
      roundApplicationMetadata,
      roundAddress,
      chainName
    );
    const application: RoundApplication = await builder.build(
      roundAddress,
      formInputs
    );

    const deterministicApplication = objectToDeterministicJSON(
      application as any
    );

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
      dispatch({
        type: ROUND_APPLICATION_ERROR,
        roundAddress,
        error: "error signing round application",
      });
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
      await contract.applyToRound(projectUniqueID, metaPtr);
      dispatch({
        type: ROUND_APPLICATION_LOADED,
        roundAddress,
      });
    } catch (e) {
      console.error("error calling applyToRound:", e);
      dispatch({
        type: ROUND_APPLICATION_ERROR,
        roundAddress,
        error: "error calling applyToRound",
      });
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
