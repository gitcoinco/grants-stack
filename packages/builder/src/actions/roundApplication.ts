import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { Allo, AnyJson, isJestRunning } from "common";
import { getConfig } from "common/src/config";
import { DataLayer, RoundCategory } from "data-layer";
import { RoundApplicationAnswers } from "data-layer/dist/roundApplication.types";
import { ethers } from "ethers";
import { Dispatch } from "redux";
import { Hex } from "viem";
import PinataClient from "common/src/services/pinata";
import { global } from "../global";
import { RootState } from "../reducers";
import { Status } from "../reducers/roundApplication";
import { Project, RoundApplication, SignedRoundApplication } from "../types";
import RoundApplicationBuilder from "../utils/RoundApplicationBuilder";
import { objectToDeterministicJSON } from "../utils/deterministicJSON";
import { metadataToProject } from "../utils/utils";

const LitJsSdk = isJestRunning() ? null : require("gitcoin-lit-js-sdk");

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
  roundAddress: string;
  ipfsHash: string;
  applicationData: SignedRoundApplication;
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

export function chainIdToChainName(chainId: number): string {
  // eslint-disable-next-line no-restricted-syntax
  for (const name in LitJsSdk.LIT_CHAINS) {
    if (LitJsSdk.LIT_CHAINS[name].chainId === chainId) {
      return name;
    }
  }

  throw new Error(`couldn't find LIT chain name for chainId ${chainId}`);
}

const applyToRound =
  (
    roundId: string,
    projectID: string,
    projectUniqueID: string,
    isV2: boolean,
    strategy: RoundCategory,
    signedApplication: SignedRoundApplication,
    allo: Allo
  ) =>
  async (dispatch: Dispatch) => {
    const result = allo.applyToRound({
      projectId: projectUniqueID as `0x${string}`,
      roundId: isV2 ? Number(roundId) : (roundId as Hex),
      metadata: signedApplication as unknown as AnyJson,
      strategy,
    });

    // Apply To Round
    await result
      .on("ipfs", (res) => {
        if (res.type === "success") {
          dispatch({
            type: ROUND_APPLICATION_LOADING,
            roundAddress: roundId,
            status: Status.SendingTx,
          });
        } else {
          console.error("IPFS Error", res.error);
          datadogRum.addError(res.error);
          datadogLogs.logger.error("ipfs: error uploading metadata");
          dispatchAndLogApplicationError(
            dispatch,
            roundId,
            "error uploading round application metadata",
            Status.UploadingMetadata
          );
        }
      })
      .on("transaction", (res) => {
        // Note: Not handled by UI
        if (res.type === "success") {
          console.log("Transaction", res.value);
        } else {
          console.error("Transaction Error", res.error);
          datadogRum.addError(res.error);
          datadogLogs.logger.warn("transaction error");
        }
      })
      .on("transactionStatus", async (res) => {
        if (res.type === "success") {
          dispatch({
            type: ROUND_APPLICATION_LOADING,
            roundAddress: roundId,
            projectId: projectID,
            status: Status.Indexing,
          });
        } else {
          dispatchAndLogApplicationError(
            dispatch,
            roundId,
            "error calling applyToRound",
            Status.SendingTx
          );
          console.log("Transaction Status Error", res.error);
        }
      })
      .on("indexingStatus", (res) => {
        if (res.type === "success") {
          dispatch({
            type: ROUND_APPLICATION_LOADED,
            roundAddress: roundId,
            projectId: projectID,
          });
        } else {
          console.error("Indexing Status Error", res.error);
        }
      })
      .execute();
  };

export const submitApplication =
  (
    roundId: string,
    formInputs: RoundApplicationAnswers,
    allo: Allo,
    createLinkedProject: boolean,
    dataLayer: DataLayer
  ) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const roundState = state.rounds[roundId];

    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundAddress: roundId, // todo: roundAddress is misleading
      status: Status.BuildingApplication,
    });

    if (roundState === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundId,
        "cannot load round data",
        Status.BuildingApplication
      );
      return;
    }

    const roundApplicationMetadata = roundState.round?.applicationMetadata;
    if (roundApplicationMetadata === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundId,
        "cannot load round application metadata",
        Status.BuildingApplication
      );
      return;
    }

    const projectQuestion =
      roundApplicationMetadata.applicationSchema.questions.find(
        (q: { type: string }) => q.type === "project"
      );

    if (!projectQuestion) {
      dispatchAndLogApplicationError(
        dispatch,
        roundId,
        "cannot find project question id",
        Status.BuildingApplication
      );
      return;
    }

    const projectID = formInputs[projectQuestion.id] as string;

    const projectMetadata: any = state.grantsMetadata[projectID].metadata;
    if (projectMetadata === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundId,
        "cannot find selected project metadata",
        Status.BuildingApplication
      );
      return;
    }

    const project: Project = metadataToProject(projectMetadata, 0);

    const { chainID } = state.web3;
    if (chainID === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundId,
        "cannot find chain id",
        Status.BuildingApplication
      );
      return;
    }
    const chainName = chainIdToChainName(chainID);

    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundId,
      status: Status.LitAuthentication,
    });

    let application: RoundApplication;
    let deterministicApplication: string;

    try {
      const roundAddress = roundState.round!.address;
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
      dispatchAndLogApplicationError(
        dispatch,
        roundId,
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
      roundId,
      status: Status.SigningApplication,
    });

    let signature: string;
    try {
      signature = await signer.signMessage(hash);
    } catch (e) {
      dispatchAndLogApplicationError(
        dispatch,
        roundId,
        "error signing round application",
        Status.SigningApplication
      );
      return;
    }

    const signedApplication: SignedRoundApplication = {
      signature,
      application,
    };
    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundAddress: roundId,
      status: Status.UploadingMetadata,
    });

    const isV2 = getConfig().allo.version === "allo-v2";

    if (createLinkedProject) {
      // Create Linked Project
      const result = allo.createProject({
        name: projectMetadata.title,
        metadata: {
          canonical: {
            registryAddress: projectMetadata.registryAddress,
            chainId: Number(projectMetadata.chainId),
          },
        },
        nonce: projectMetadata.nonce,
        memberAddresses: [],
      });

      dispatch({
        type: ROUND_APPLICATION_LOADING,
        roundAddress: roundId,
        status: Status.CreateProject,
      });

      await result
        .on("ipfs", (res) => {
          if (res.type === "success") {
            console.log("IPFS CID", res.value);
          } else {
            console.error("profile creation: IPFS Error", res.error);
            datadogRum.addError(res.error);
            datadogLogs.logger.error("ipfs: error uploading metadata");
          }
        })
        .on("transaction", (res) => {
          if (res.type === "success") {
            console.log("Transaction", res.value);
          } else {
            console.error("profile creation: Transaction Error", res.error);
            datadogRum.addError(res.error);
            datadogLogs.logger.warn("transaction error");
            dispatchAndLogApplicationError(
              dispatch,
              roundId,
              "error creating linked project",
              Status.SigningApplication
            );
          }
        })
        .on("indexingStatus", async (res) => {
          if (res.type === "success") {
            console.log(
              "profile creation: Transaction Status Success",
              res.value
            );

            const projectUniqueID = isV2
              ? await dataLayer.getProjectAnchorByIdAndChainId({
                  projectId: projectID,
                  chainId: Number(chainID),
                })
              : projectID;

            if (!projectUniqueID) {
              dispatchAndLogApplicationError(
                dispatch,
                roundId,
                "error no projectUniqueID",
                Status.SigningApplication
              );
              return;
            }

            dispatch<any>(
              applyToRound(
                roundId,
                projectID,
                projectUniqueID,
                isV2,
                roundState.round?.payoutStrategy!,
                signedApplication,
                allo
              )
            );
          } else {
            console.log(
              "profile creation: Transaction Status Error",
              res.error
            );
          }
        })
        .execute();
    } else {
      const projectUniqueID = isV2
        ? await dataLayer.getProjectAnchorByIdAndChainId({
            projectId: projectID,
            chainId: Number(chainID),
          })
        : projectID;

      if (!projectUniqueID) {
        dispatchAndLogApplicationError(
          dispatch,
          roundId,
          "error no projectUniqueID",
          Status.SigningApplication
        );
        return;
      }

      dispatch<any>(
        applyToRound(
          roundId,
          projectID,
          projectUniqueID,
          isV2,
          roundState.round?.payoutStrategy!,
          signedApplication,
          allo
        )
      );
    }
  };

export const checkRoundApplications =
  (
    chainId: Number,
    roundAddress: string,
    projectIDs: Array<string>,
    dataLayer: DataLayer
  ) =>
  async (dispatch: Dispatch) => {
    try {
      const applications =
        await dataLayer.getApplicationsByRoundIdAndProjectIds({
          chainId: chainId as number,
          roundId: roundAddress.toLowerCase() as `0x${Lowercase<string>}`,
          projectIds: projectIDs,
        });

      if (!applications || applications.length === 0) {
        dispatch({
          type: ROUND_APPLICATION_NOT_FOUND,
          roundAddress,
        });
        return;
      }

      projectIDs.forEach((projectId) => {
        const app = applications.find(
          (application) => application.projectId === projectId
        );

        if (app) {
          dispatch({
            type: ROUND_APPLICATION_FOUND,
            roundAddress,
            projectID: projectId,
          });
        }
      });
    } catch (e) {
      datadogLogs.logger.warn("error getting round applications");
      datadogRum.addError(e);
      console.error("error getting round applications");
    }
  };

export const fetchApplicationData =
  (ipfsHash: string, roundAddress: string) => async (dispatch: Dispatch) => {
    const pinataClient = new PinataClient(getConfig());
    try {
      const applicationMetadata = await pinataClient.fetchJson(ipfsHash);

      dispatch({
        type: APPLICATION_DATA_LOADED,
        applicationData: applicationMetadata,
        roundAddress,
        ipfsHash,
      });
    } catch (e) {
      dispatch({
        type: APPLICATION_DATA_LOADED,
        applicationData: { error: "Unable to fetch application" },
        roundAddress,
        ipfsHash,
      });
    }
  };
