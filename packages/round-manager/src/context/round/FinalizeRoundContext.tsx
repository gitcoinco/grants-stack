import {
  MatchingStatsData,
  MetadataPointer,
  ProgressStatus,
  Web3Instance,
} from "../../features/api/types";
import React, { createContext, useContext, useReducer } from "react";
import { useWallet } from "../../features/common/Auth";
import { saveToIPFS } from "../../features/api/ipfs";
import { datadogLogs } from "@datadog/browser-logs";
import { ethers } from "ethers";
import { generateMerkleTree } from "../../features/api/utils";
import { updateDistributionToContract } from "../../features/api/payoutStrategy/payoutStrategy";

export interface FinalizeRoundState {
  IPFSCurrentStatus: ProgressStatus;
  finalizeRoundToContractStatus: ProgressStatus;
}

interface _finalizeRoundParams {
  dispatch: Dispatch;
  payoutStrategy: string;
  matchingJSON: MatchingStatsData[] | undefined;
  signerOrProvider: Web3Instance["provider"];
}

type Action =
  | SET_DEPLOYMENT_STATUS_ACTION
  | SET_STORING_STATUS_ACTION
  | RESET_TO_INITIAL_STATE_ACTION;

type SET_STORING_STATUS_ACTION = {
  type: ActionType.SET_STORING_STATUS;
  payload: {
    IPFSCurrentStatus: ProgressStatus;
  };
};

type SET_DEPLOYMENT_STATUS_ACTION = {
  type: ActionType.SET_DEPLOYMENT_STATUS;
  payload: {
    finalizeRoundToContractStatus: ProgressStatus;
  };
};

type RESET_TO_INITIAL_STATE_ACTION = {
  type: ActionType.RESET_TO_INITIAL_STATE;
};

type Dispatch = (action: Action) => void;

enum ActionType {
  SET_STORING_STATUS = "SET_STORING_STATUS",
  SET_DEPLOYMENT_STATUS = "SET_DEPLOYMENT_STATUS",
  RESET_TO_INITIAL_STATE = "RESET_TO_INITIAL_STATE",
}

export const initialFinalizeRoundState: FinalizeRoundState = {
  IPFSCurrentStatus: ProgressStatus.NOT_STARTED,
  finalizeRoundToContractStatus: ProgressStatus.NOT_STARTED,
};

export const FinalizeRoundContext = createContext<
  { state: FinalizeRoundState; dispatch: Dispatch } | undefined
>(undefined);

const finalizeRoundReducer = (state: FinalizeRoundState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_STORING_STATUS:
      return { ...state, IPFSCurrentStatus: action.payload.IPFSCurrentStatus };
    case ActionType.SET_DEPLOYMENT_STATUS:
      return {
        ...state,
        finalizeRoundToContractStatus:
          action.payload.finalizeRoundToContractStatus,
      };
    case ActionType.RESET_TO_INITIAL_STATE: {
      return initialFinalizeRoundState;
    }
    default:
      return state;
  }
};

export const FinalizeRoundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    finalizeRoundReducer,
    initialFinalizeRoundState
  );

  const providerProps = {
    state,
    dispatch,
  };

  return (
    <FinalizeRoundContext.Provider value={providerProps}>
      {children}
    </FinalizeRoundContext.Provider>
  );
};

const _finalizeRound = async ({
  dispatch,
  payoutStrategy,
  matchingJSON,
  signerOrProvider,
}: _finalizeRoundParams) => {
  dispatch({
    type: ActionType.RESET_TO_INITIAL_STATE,
  });
  try {
    if (!matchingJSON) {
      throw new Error("matchingJSON is undefined");
    }
    const { tree, matchingResults } = generateMerkleTree(matchingJSON);
    const merkleRoot = tree.root;

    const IpfsHash = await storeDocument(dispatch, matchingResults);

    const distributionMetaPtr = {
      protocol: 1,
      pointer: IpfsHash,
    };

    const transactionBlockNumber = await finalizeToContract(
      dispatch,
      payoutStrategy,
      merkleRoot,
      distributionMetaPtr,
      signerOrProvider
    );
    console.log("transactionBlockNumber: ", transactionBlockNumber);
  } catch (error) {
    datadogLogs.logger.error(`error: _finalizeRound - ${error}`);
    console.error("_finalizeRound: ", error);
  }
};

export const useFinalizeRound = () => {
  const context = useContext(FinalizeRoundContext);
  if (context === undefined) {
    throw new Error(
      "useFinalizeRound must be used within a FinalizeRoundProvider"
    );
  }

  const { signer: walletSigner } = useWallet();

  const finalizeRound = (
    payoutStrategy: string,
    matchingJSON: MatchingStatsData[] | undefined
  ) => {
    return _finalizeRound({
      dispatch: context.dispatch,
      payoutStrategy,
      matchingJSON,
      // @ts-expect-error TODO: resolve this situation around signers and providers
      signerOrProvider: walletSigner,
    });
  };

  return {
    finalizeRound,
    IPFSCurrentStatus: context.state.IPFSCurrentStatus,
    finalizeRoundToContractStatus: context.state.finalizeRoundToContractStatus,
  };
};

async function storeDocument(
  dispatch: (action: Action) => void,
  matchingJSON: MatchingStatsData[]
) {
  datadogLogs.logger.info(`storeDocument: matchingDistribution`);

  dispatch({
    type: ActionType.SET_STORING_STATUS,
    payload: { IPFSCurrentStatus: ProgressStatus.IN_PROGRESS },
  });

  try {
    const IpfsHash: string = await saveToIPFS({
      content: { matchingDistribution: matchingJSON },
      metadata: {
        name: "matching-distribution",
      },
    });

    dispatch({
      type: ActionType.SET_STORING_STATUS,
      payload: { IPFSCurrentStatus: ProgressStatus.IS_SUCCESS },
    });

    return IpfsHash;
  } catch (error) {
    datadogLogs.logger.error(`error: storeDocument - ${error}`);
    console.error(`storeDocument`, error);
    dispatch({
      type: ActionType.SET_STORING_STATUS,
      payload: { IPFSCurrentStatus: ProgressStatus.IS_ERROR },
    });
    throw error;
  }
}

async function finalizeToContract(
  dispatch: (action: Action) => void,
  payoutStrategy: string,
  merkleRoot: string,
  distributionMetaPtr: { protocol: number; pointer: string },
  signerOrProvider: Web3Instance["provider"]
) {
  try {
    dispatch({
      type: ActionType.SET_DEPLOYMENT_STATUS,
      payload: { finalizeRoundToContractStatus: ProgressStatus.IN_PROGRESS },
    });

    const encodedDistribution = encodeDistributionParameters(
      merkleRoot,
      distributionMetaPtr
    );

    const { transactionBlockNumber } = await updateDistributionToContract({
      payoutStrategy,
      encodedDistribution,
      // @ts-expect-error TODO: resolve this situation around signers and providers
      signerOrProvider: signerOrProvider,
    });

    dispatch({
      type: ActionType.SET_DEPLOYMENT_STATUS,
      payload: { finalizeRoundToContractStatus: ProgressStatus.IS_SUCCESS },
    });

    return transactionBlockNumber;
  } catch (error) {
    datadogLogs.logger.error(`error: finalizeRoundToContract - ${error}`);
    console.error(`finalizeRoundToContract`, error);
    dispatch({
      type: ActionType.SET_DEPLOYMENT_STATUS,
      payload: { finalizeRoundToContractStatus: ProgressStatus.IS_ERROR },
    });

    throw error;
  }
}

function encodeDistributionParameters(
  merkleRoot: string,
  distributionMetaPtr: MetadataPointer
) {
  return ethers.utils.defaultAbiCoder.encode(
    ["bytes32", "tuple(uint256 protocol, string pointer)"],
    [merkleRoot, distributionMetaPtr]
  );
}
