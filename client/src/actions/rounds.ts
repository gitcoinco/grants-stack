import { Dispatch } from "redux";
// import { RootState } from "../reducers";
import { ethers, BigNumber } from "ethers";
import RoundABI from "../contracts/abis/Round.json";
import { global } from "../global";
import { Round, MetaPtr } from "../types";
import PinataClient from "../services/pinata";

export const ROUNDS_LOADING_META_PTR = "ROUNDS_LOADING_META_PTR";
interface RoundsLoadingMetaPtrAction {
  type: typeof ROUNDS_LOADING_META_PTR;
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
  | RoundsLoadingMetaPtrAction
  | RoundsRoundLoadedAction
  | RoundsUnloadedAction
  | RoundsLoadingErrorAction;

const loadingMetaPtr = (address: string): RoundsActions => ({
  type: ROUNDS_LOADING_META_PTR,
  address,
});

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
  dispatch(loadingMetaPtr(address));

  const signer = global.web3Provider!.getSigner();
  const contract = new ethers.Contract(address, RoundABI, signer);

  let metaPtr: MetaPtr;
  try {
    metaPtr = await contract.roundMetaPtr();
  } catch (e) {
    dispatch(loadingError(address, "error loading round metaPtr"));
    console.error(e);
    return;
  }

  let metadata: string;
  try {
    const pinataClient = new PinataClient();
    metadata = await pinataClient.fetchText(metaPtr.pointer);
  } catch (e) {
    dispatch(loadingError(address, "error loading metadata"));
    console.error(e);
    return;
  }

  setTimeout(() => {
    const testRound = {
      address,
      name: "Test Round",
      metaPtr: {
        protocol: BigNumber.from(metaPtr.protocol).toString(),
        pointer: metaPtr.pointer,
      },
      metadata,
    };
    dispatch(roundLoaded(address, testRound));
  }, 1000);
};
