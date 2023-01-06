import {
  MetadataPointer,
  ProgressStatus,
  Web3Instance,
} from "../../features/api/types";
import React, { createContext, useContext, useReducer } from "react";
import { useWallet } from "../../features/common/Auth";
import { saveToIPFS } from "../../features/api/ipfs";
import { deployProgramContract } from "../../features/api/program";
import { datadogLogs } from "@datadog/browser-logs";
import { ethers } from "ethers";

export interface FinalizeRoundState {
  IPFSCurrentStatus: ProgressStatus;
  finalizeRoundToContractStatus: ProgressStatus;
}

interface _finalizeRoundParams {
  dispatch: Dispatch;
  encodedDistribution: string;
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
  }
  return state;
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
  encodedDistribution,
  signerOrProvider,
}: _finalizeRoundParams) => {
  dispatch({
    type: ActionType.RESET_TO_INITIAL_STATE,
  });
  try {
    const IpfsHash = await storeDocument(dispatch, encodedDistribution);

    // TODO: add finalize to contract
    // const metadata = {
    //   protocol: 1,
    //   pointer: IpfsHash,
    // };
    // const transactionBlockNumber = await finalizeToContract(
    //   dispatch,
    //   encodedDistribution,
    //   signerOrProvider
    // );
  } catch (error) {
    datadogLogs.logger.error(`error: _createProgram - ${error}`);
    console.error("_createProgram: ", error);
  }
};
export const useFinalizeRound = () => {
  const context = useContext(FinalizeRoundContext);
  if (context === undefined) {
    throw new Error("useCreateProgram must be used within a ProgramProvider");
  }

  const { signer: walletSigner } = useWallet();

  const finalizeRound = (encodedDistribution: string) => {
    return _finalizeRound({
      dispatch: context.dispatch,
      encodedDistribution,
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
  programName: string
) {
  datadogLogs.logger.info(`storeDocument: programName - ${programName}`);

  dispatch({
    type: ActionType.SET_STORING_STATUS,
    payload: { IPFSCurrentStatus: ProgressStatus.IN_PROGRESS },
  });

  try {
    const IpfsHash: string = await saveToIPFS({
      content: { name: programName },
      metadata: {
        name: "program-metadata",
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

// ToDo: add finalize to contract
async function finalizeToContract(
  dispatch: (action: Action) => void,
  roundId: string,
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
    const { transactionBlockNumber } = await finalizeRoundToContract({
      roundId,
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
    ["bytes32", "MetadataPointer"],
    [merkleRoot, distributionMetaPtr]
  );
}
