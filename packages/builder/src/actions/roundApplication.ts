import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { Allo, AnyJson, isJestRunning } from "common";
import { ethers } from "ethers";
import { Dispatch } from "redux";
import { getConfig } from "common/src/config";
import { RoundApplicationAnswers } from "data-layer/dist/roundApplication.types";
import { Hex } from "viem";
import { DataLayer } from "data-layer";
import { global } from "../global";
import { RootState } from "../reducers";
import { Status } from "../reducers/roundApplication";
import PinataClient from "../services/pinata";
import { Project, RoundApplication, SignedRoundApplication } from "../types";
import { objectToDeterministicJSON } from "../utils/deterministicJSON";
import RoundApplicationBuilder from "../utils/RoundApplicationBuilder";
import { metadataToProject } from "../utils/utils";
import { graphqlFetch } from "../utils/graphql";

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

export const submitApplication =
  (roundId: string, formInputs: RoundApplicationAnswers, allo: Allo) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const roundState = state.rounds[roundId];
    const isV2 = getConfig().allo.version === "allo-v2";

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

    const result = allo.applyToRound({
      projectId: projectID as `0x${string}`,
      roundId: isV2 ? Number(roundId) : (roundId as Hex),
      metadata: signedApplication as unknown as AnyJson,
    });

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
            type: ROUND_APPLICATION_LOADED,
            roundAddress: roundId,
            projectId: projectID,
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
      .execute();
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

      console.log("applications", applications);

      if (!applications || applications.length === 0) {
        dispatch({
          type: ROUND_APPLICATION_NOT_FOUND,
          roundAddress,
        });
        return;
      }

      console.log("applications", applications);

      projectIDs.forEach((projectId) => {
        // VALIDATE THIS
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

      // applicationEvents = await contract.queryFilter(applicationFilter); // WTF IS THIS?

      // applicationEvents.forEach((event) => {
      // const projectID = uniqueIDsToIDs[event?.args?.project];
      // if (data !== undefined) {
      //   dispatch({
      //     type: ROUND_APPLICATION_FOUND,
      //     roundAddress,
      //     projectID,
      //   });
      // }
      // });
    } catch (e) {
      datadogLogs.logger.warn("error getting round applications");
      datadogRum.addError(e);
      console.error("error getting round applications");
    }
  };

export const fetchApplicationData =
  (ipfsHash: string, roundAddress: string, chainId: string) =>
  async (dispatch: Dispatch) => {
    const pinataClient = new PinataClient(getConfig());
    try {
      // FETCH roundApplication DATA
      const resp = await pinataClient.fetchJson(ipfsHash);

      // FETCH roundApplication STATUS
      const roundApplication = await graphqlFetch(
        `
          query GetRoundApplicationByIPFSHash(
                $roundId: String,
                $ipfsHash: String,
              ) {
            roundApplications(
              where: {
                round_: {
                  id: $roundId
                },
                metaPtr_: {
                  pointer: $ipfsHash
                }
              }
            ) {
              id
              applicationIndex
              inReview
              project
              status
              statusDescription
              statusSnapshots {
                id
                status
                statusDescription
                timestamp
              }
            }
          }
        `,
        Number(chainId),
        {
          roundId: roundAddress,
          ipfsHash,
        }
      );

      // ASSIGNS roundApplication STATUS
      resp.status =
        roundApplication.data.roundApplications[0].statusDescription;

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
