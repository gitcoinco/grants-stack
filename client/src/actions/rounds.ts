import { Dispatch } from "redux";
// import { RootState } from "../reducers";
import { ethers, BigNumber } from "ethers";
import RoundABI from "../contracts/abis/Round.json";
import { global } from "../global";
import { Round, MetaPtr } from "../types";
import PinataClient from "../services/pinata";

export const ROUNDS_LOADING_ROUND_META_PTR = "ROUNDS_LOADING_ROUND_META_PTR";
interface RoundsLoadingRoundMetaPtrAction {
  type: typeof ROUNDS_LOADING_ROUND_META_PTR;
  address: string;
}

export const ROUNDS_LOADING_ROUND_METADATA = "ROUNDS_LOADING_ROUND_METADATA";
interface RoundsLoadingRoundMetadataAction {
  type: typeof ROUNDS_LOADING_ROUND_METADATA;
  address: string;
}

export const ROUNDS_LOADING_APPLICATION_META_PTR =
  "ROUNDS_LOADING_APPLICATION_META_PTR";
interface RoundsLoadingApplicationMetaPtrAction {
  type: typeof ROUNDS_LOADING_APPLICATION_META_PTR;
  address: string;
}

export const ROUNDS_LOADING_APPLICATION_METADATA =
  "ROUNDS_LOADING_APPLICATION_METADATA";
interface RoundsLoadingApplicationMetadataAction {
  type: typeof ROUNDS_LOADING_APPLICATION_METADATA;
  address: string;
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
  | RoundsLoadingRoundMetaPtrAction
  | RoundsLoadingRoundMetadataAction
  | RoundsLoadingApplicationMetaPtrAction
  | RoundsLoadingApplicationMetadataAction
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
  dispatch({ type: ROUNDS_LOADING_ROUND_META_PTR, address });

  const signer = global.web3Provider!.getSigner();
  const contract = new ethers.Contract(address, RoundABI, signer);
  const pinataClient = new PinataClient();

  let roundMetaPtr: MetaPtr;
  try {
    roundMetaPtr = await contract.roundMetaPtr();
  } catch (e) {
    dispatch(loadingError(address, "error loading round metaPtr"));
    console.error(e);
    return;
  }

  dispatch({ type: ROUNDS_LOADING_ROUND_METADATA, address });

  let roundMetadata: string;
  try {
    roundMetadata = await pinataClient.fetchText(roundMetaPtr.pointer);
  } catch (e) {
    dispatch(loadingError(address, "error loading round metadata"));
    console.error(e);
    return;
  }

  dispatch({ type: ROUNDS_LOADING_APPLICATION_META_PTR, address });

  let applicationMetaPtr: MetaPtr;
  try {
    applicationMetaPtr = await contract.applicationMetaPtr();
  } catch (e) {
    dispatch(loadingError(address, "error loading application metaPtr"));
    console.error(e);
    return;
  }

  dispatch({ type: ROUNDS_LOADING_APPLICATION_METADATA, address });

  let applicationMetadata: string;
  try {
    applicationMetadata = await pinataClient.fetchText(
      applicationMetaPtr.pointer
    );
  } catch (e) {
    dispatch(loadingError(address, "error loading application metadata"));
    console.error(e);
    return;
  }

  setTimeout(() => {
    const testRound = {
      address,
      name: "Test Round",
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
  }, 1000);
};
