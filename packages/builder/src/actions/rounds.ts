import { Dispatch } from "redux";
// import { RootState } from "../reducers";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { BigNumber, ethers } from "ethers";
import { getConfig } from "common/src/config";
import { graphqlFetch } from "../utils/graphql";
import ProgramABI from "../contracts/abis/ProgramImplementation.json";
import RoundABI from "../contracts/abis/RoundImplementation.json";
import { RootState } from "../reducers";
import { PayoutStrategy, Status } from "../reducers/rounds";
import PinataClient from "../services/pinata";
import { MetaPtr, ProgramMetadata, Round, RoundMetadata } from "../types";
import { getProviderByChainId } from "../utils/utils";
import { RoundApplicationMetadata } from "../types/roundApplication";
import { parseRoundApplicationMetadata } from "../utils/roundApplication";

export const ROUNDS_LOADING_ROUND = "ROUNDS_LOADING_ROUND";
interface RoundsLoadingRoundAction {
  type: typeof ROUNDS_LOADING_ROUND;
  address: string;
  status: Status;
}

export const ROUNDS_ROUND_LOADED = "ROUNDS_ROUND_LOADED";
interface RoundsRoundLoadedAction {
  type: typeof ROUNDS_ROUND_LOADED;
  address: string;
  round: Round;
}

export const ROUNDS_UNLOADED = "ROUNDS_UNLOADED";
interface RoundsUnloadedAction {
  type: typeof ROUNDS_UNLOADED;
}

export const ROUNDS_LOADING_ERROR = "ROUNDS_LOADING_ERROR";
interface RoundsLoadingErrorAction {
  type: typeof ROUNDS_LOADING_ERROR;
  address: string;
  error: string;
}

export type RoundsActions =
  | RoundsLoadingRoundAction
  | RoundsRoundLoadedAction
  | RoundsUnloadedAction
  | RoundsLoadingErrorAction;

export const roundLoaded = (address: string, round: Round): RoundsActions => ({
  type: ROUNDS_ROUND_LOADED,
  address,
  round,
});

const roundsUnloaded = (): RoundsActions => ({
  type: ROUNDS_UNLOADED,
});

const loadingError = (address: string, error: string): RoundsActions => ({
  type: ROUNDS_LOADING_ERROR,
  address,
  error,
});

export const unloadRounds = () => roundsUnloaded();

const isTooBig = (bigNumber: BigNumber) =>
  bigNumber.eq(ethers.constants.MaxUint256);

export const loadRound =
  (address: string, roundChainId?: number) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      // address validation
      ethers.utils.getAddress(address);
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.warn(`invalid address or address checksum ${address}`);
      dispatch(loadingError(address, "invalid address or address checksum"));
      console.error(e);
      return;
    }

    const state = getState();
    const { chainID: stateChainID } = state.web3;

    const chainId = roundChainId || stateChainID;

    const appProvider = getProviderByChainId(chainId!);

    const contract = new ethers.Contract(address, RoundABI, appProvider);
    const pinataClient = new PinataClient(getConfig());

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingApplicationsStartTime,
    });

    let applicationsStartTime;
    try {
      const ast: BigNumber = await contract.applicationsStartTime();
      applicationsStartTime = ast.toNumber();
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error(
        `contract: error loading application start time ${contract.address}`
      );
      dispatch(loadingError(address, "error loading application start time"));
      console.error(e);
      return;
    }

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingApplicationsEndTime,
    });

    let applicationsEndTime;
    try {
      const aet: BigNumber = await contract.applicationsEndTime();
      // fixes infinite applicationsEndTime representation
      applicationsEndTime = isTooBig(aet)
        ? Number.MAX_SAFE_INTEGER
        : aet.toNumber();
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error(
        `contract: error loading application end time ${contract.address}`
      );
      dispatch(loadingError(address, "error loading application end time"));
      console.error(e);
      return;
    }

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingRoundStartTime,
    });

    let roundStartTime;
    try {
      const rst: BigNumber = await contract.roundStartTime();
      roundStartTime = rst.toNumber();
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error(
        `contract: error loading round start time ${contract.address}`
      );
      dispatch(loadingError(address, "error loading round start time"));
      console.error(e);
      return;
    }

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingRoundEndTime,
    });

    let roundEndTime;
    try {
      const ret: BigNumber = await contract.roundEndTime();
      // fixes infinite roundEndTime representation
      roundEndTime = isTooBig(ret) ? Number.MAX_SAFE_INTEGER : ret.toNumber();
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error(
        `contract: error loading round end time ${contract.address}`
      );
      dispatch(loadingError(address, "error loading round end time"));
      console.error(e);
      return;
    }

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingToken,
    });

    let token;
    try {
      token = await contract.token();
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error(
        `contract: error loading round token ${contract.address}`
      );
      dispatch(loadingError(address, "error loading round token"));
      console.error(e);
      return;
    }

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingRoundMetaPtr,
    });

    let roundMetaPtr: MetaPtr;
    try {
      roundMetaPtr = await contract.roundMetaPtr();
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error(
        `contract: error loading round metaPtr ${contract.address}`
      );
      dispatch(loadingError(address, "error loading round metaPtr"));
      console.error(e);
      return;
    }

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingRoundMetadata,
    });

    let roundMetadata: RoundMetadata;
    try {
      const resp = await pinataClient.fetchText(roundMetaPtr.pointer);
      roundMetadata = JSON.parse(resp);
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error(
        `contract: error loading round metadata ${contract.address}`
      );
      dispatch(loadingError(address, "error loading round metadata"));
      console.error(e);
      return;
    }

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingApplicationMetaPtr,
    });

    let applicationMetaPtr: MetaPtr;
    try {
      applicationMetaPtr = await contract.applicationMetaPtr();
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error(
        `contract: error loading application metaPtr ${contract.address}`
      );
      dispatch(loadingError(address, "error loading application metaPtr"));
      console.error(e);
      return;
    }

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingApplicationMetadata,
    });

    let applicationMetadata: RoundApplicationMetadata;
    try {
      const resp = await pinataClient.fetchText(applicationMetaPtr.pointer);
      applicationMetadata = parseRoundApplicationMetadata(JSON.parse(resp));
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error("ipfs: error loading application metadata");
      dispatch(loadingError(address, "error loading application metadata"));
      console.error(e);
      return;
    }

    let programName = "";

    if (roundMetadata.programContractAddress !== undefined) {
      const programContract = new ethers.Contract(
        roundMetadata.programContractAddress,
        ProgramABI,
        appProvider
      );

      dispatch({
        type: ROUNDS_LOADING_ROUND,
        address,
        status: Status.LoadingProgramMetaPtr,
      });

      let programMetaPtr: MetaPtr;
      try {
        programMetaPtr = await programContract.metaPtr();
      } catch (e) {
        datadogRum.addError(e);
        datadogLogs.logger.error(
          `contract: error loading program metaPtr ${programContract.address}`
        );
        dispatch(loadingError(address, "error loading program metaPtr"));
        console.error(e);
        return;
      }

      dispatch({
        type: ROUNDS_LOADING_ROUND,
        address,
        status: Status.LoadingProgramMetadata,
      });

      let programMetadata: ProgramMetadata;
      try {
        const resp = await pinataClient.fetchText(programMetaPtr.pointer);
        programMetadata = JSON.parse(resp);
        programName = programMetadata.name;
      } catch (e) {
        datadogRum.addError(e);
        datadogLogs.logger.error("ipfs: error loading program metadata");
        dispatch(loadingError(address, "error loading program metadata"));
        console.error(e);
        return;
      }
    }

    dispatch({
      type: ROUNDS_LOADING_ROUND,
      address,
      status: Status.LoadingRoundPayoutStrategy,
    });

    let roundPayoutStrategy: PayoutStrategy;
    try {
      const resp = await graphqlFetch(
        `
          query GetRoundById($roundId: String) {
            rounds(where: {
              id: $roundId
            }) {
              id
              payoutStrategy {
                id
                strategyName
              }
            }
          }
        `,
        chainId!,
        { roundId: address }
      );
      roundPayoutStrategy = resp.data.rounds[0].payoutStrategy
        ? resp.data.rounds[0].payoutStrategy.strategyName
        : "MERKLE";
    } catch (e) {
      datadogRum.addError(e);
      datadogLogs.logger.error("sg: error loading round payoutStrategy");
      dispatch(loadingError(address, "error loading round payoutStrategy"));
      console.error(e);
      return;
    }

    const round = {
      address,
      applicationsStartTime,
      applicationsEndTime,
      roundStartTime,
      roundEndTime,
      token,
      roundMetaPtr: {
        protocol: BigNumber.from(roundMetaPtr.protocol).toString(),
        pointer: roundMetaPtr.pointer,
      },
      roundMetadata,
      applicationMetaPtr: {
        protocol: BigNumber.from(applicationMetaPtr.protocol).toString(),
        pointer: applicationMetaPtr.pointer,
      },
      applicationMetadata,
      programName,
      payoutStrategy: roundPayoutStrategy,
    };

    dispatch(roundLoaded(address, round));
  };
