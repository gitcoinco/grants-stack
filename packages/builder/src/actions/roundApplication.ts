import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { Allo, AnyJson, ChainId, isJestRunning } from "common";
import { ethers } from "ethers";
import { Dispatch } from "redux";
import { getConfig } from "common/src/config";
import { RoundApplicationAnswers } from "data-layer/dist/roundApplication.types";
import { Hex } from "viem";
import RoundABI from "../contracts/abis/RoundImplementation.json";
import { global } from "../global";
import { RootState } from "../reducers";
import { Status } from "../reducers/roundApplication";
import PinataClient from "../services/pinata";
import { Project, RoundApplication, SignedRoundApplication } from "../types";
import { objectToDeterministicJSON } from "../utils/deterministicJSON";
import generateUniqueRoundApplicationID from "../utils/roundApplication";
import RoundApplicationBuilder from "../utils/RoundApplicationBuilder";
import { getProjectURIComponents, metadataToProject } from "../utils/utils";
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
  (roundAddress: string, formInputs: RoundApplicationAnswers, allo: Allo) =>
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

    const projectQuestion =
      roundApplicationMetadata.applicationSchema.questions.find(
        (q: { type: string }) => q.type === "project"
      );

    if (!projectQuestion) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "cannot find project question id",
        Status.BuildingApplication
      );
      return;
    }

    const projectID = formInputs[projectQuestion.id] as string;

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
    if (chainID === undefined) {
      dispatchAndLogApplicationError(
        dispatch,
        roundAddress,
        "cannot find chain id",
        Status.BuildingApplication
      );
      return;
    }
    const chainName = chainIdToChainName(chainID);

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

    const projectUniqueID = generateUniqueRoundApplicationID(
      Number(projectChainId),
      projectNumber,
      projectRegistryAddress
    ) as Hex;

    dispatch({
      type: ROUND_APPLICATION_LOADING,
      roundAddress,
      status: Status.UploadingMetadata,
    });

    const result = allo.applyToRound({
      projectId: projectUniqueID,
      roundId: roundAddress as Hex,
      metadata: signedApplication as unknown as AnyJson,
    });

    await result
      .on("ipfs", (res) => {
        if (res.type === "success") {
          console.log("IPFS CID", res.value);
          dispatch({
            type: ROUND_APPLICATION_LOADING,
            roundAddress,
            status: Status.SendingTx,
          });
        } else {
          console.error("IPFS Error", res.error);
          datadogRum.addError(res.error);
          datadogLogs.logger.error("ipfs: error uploading metadata");
          dispatchAndLogApplicationError(
            dispatch,
            roundAddress,
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
            roundAddress,
            projectId: projectID,
          });
        } else {
          dispatchAndLogApplicationError(
            dispatch,
            roundAddress,
            "error calling applyToRound",
            Status.SendingTx
          );
          console.log("Transaction Status Error", res.error);
        }
      })
      .execute();
  };

export const checkRoundApplications =
  (chainID: ChainId, roundAddress: string, projectIDs: Array<string>) =>
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
