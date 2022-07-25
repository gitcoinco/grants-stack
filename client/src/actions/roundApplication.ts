import { Dispatch } from "redux";
import { Status } from "../reducers/roundApplication";
import { RootState } from "../reducers";
import RoundApplicationBuilder from "../utils/RoundApplicationBuilder";
import { Metadata, Project } from "../types";

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

export const ROUND_APPLICATION_LOADED = "ROUND_APPLICATION_LOADED";
interface RoundApplicationLoadedAction {
  type: typeof ROUND_APPLICATION_LOADED;
  roundAddress: string;
}

export type RoundApplicationActions =
  | RoundApplicationLoadingAction
  | RoundApplicationErrorAction
  | RoundApplicationLoadedAction;

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
      status: Status.UploadingMetadata,
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
    const projectMetadata: Metadata | undefined =
      state.grantsMetadata[Number(projectId)].metadata;
    if (projectMetadata === undefined) {
      dispatch(
        applicationError(roundAddress, "cannot find selected project metadata")
      );
      return;
    }

    const project: Project = {
      lastUpdated: 0,
      id: projectId,
      title: projectMetadata.title,
      description: projectMetadata.description,
      website: projectMetadata.website,
      bannerImg: projectMetadata.projectImg,
      logoImg: projectMetadata.projectImg!,
      metaPtr: {
        protocol: String(projectMetadata.protocol),
        pointer: projectMetadata.pointer,
      },
    };

    const builder = new RoundApplicationBuilder(
      project,
      roundApplicationMetadata
    );
    const application = builder.build(roundAddress, formInputs);
    console.log("------------------");
    console.log(application);
  };
