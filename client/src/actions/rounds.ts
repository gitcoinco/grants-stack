import { Dispatch } from "redux";
// import { RootState } from "../reducers";
import { ethers, BigNumber } from "ethers";
import RoundABI from "../contracts/abis/Round.json";
import { global } from "../global";
import {
  Round,
  MetaPtr,
  RoundMetadata,
  RoundApplicationMetadata,
} from "../types";
import PinataClient from "../services/pinata";
import { Status } from "../reducers/rounds";

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

const roundLoaded = (address: string, round: Round): RoundsActions => ({
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

export const loadRound = (address: string) => async (dispatch: Dispatch) => {
  const signer = global.web3Provider!.getSigner();
  const contract = new ethers.Contract(address, RoundABI, signer);
  const pinataClient = new PinataClient();

  dispatch({
    type: ROUNDS_LOADING_ROUND,
    address,
    status: Status.LoadingApplicationsStartTime,
  });

  const ast: BigNumber = await contract.applicationsStartTime();
  const applicationsStartTime = ast.toNumber();

  dispatch({
    type: ROUNDS_LOADING_ROUND,
    address,
    status: Status.LoadingApplicationsEndTime,
  });

  const aet: BigNumber = await contract.applicationsEndTime();
  const applicationsEndTime = aet.toNumber();

  dispatch({
    type: ROUNDS_LOADING_ROUND,
    address,
    status: Status.LoadingRoundStartTime,
  });

  const rst: BigNumber = await contract.roundStartTime();
  const roundStartTime = rst.toNumber();

  dispatch({
    type: ROUNDS_LOADING_ROUND,
    address,
    status: Status.LoadingRoundEndTime,
  });

  const ret: BigNumber = await contract.roundEndTime();
  const roundEndTime = ret.toNumber();

  dispatch({
    type: ROUNDS_LOADING_ROUND,
    address,
    status: Status.LoadingToken,
  });

  const token = await contract.token();

  dispatch({
    type: ROUNDS_LOADING_ROUND,
    address,
    status: Status.LoadingRoundMetaPtr,
  });

  let roundMetaPtr: MetaPtr;
  try {
    roundMetaPtr = await contract.roundMetaPtr();
  } catch (e) {
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
    applicationMetadata = JSON.parse(resp);
  } catch (e) {
    dispatch(loadingError(address, "error loading application metadata"));
    console.error(e);
    return;
  }

  const testRound = {
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
  };

  dispatch(roundLoaded(address, testRound));
};
