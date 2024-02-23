import { ProgressStatus, Web3Instance } from "../../features/api/types";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import React, { createContext, useContext, useReducer } from "react";
import { useWallet } from "../../features/common/Auth";
import { saveToIPFS } from "../../features/api/ipfs";
import { deployProgramContract } from "../../features/api/program";
import { datadogLogs } from "@datadog/browser-logs";
import { useAllo } from "common";

export interface CreateProgramState {
  IPFSCurrentStatus: ProgressStatus;
  contractDeploymentStatus: ProgressStatus;
  indexingStatus: ProgressStatus;
}

interface _createProgramParams {
  dispatch: Dispatch;
  programName: string;
  operatorWallets: string[];
  signerOrProvider: Web3Instance["provider"];
}

type Action =
  | SET_DEPLOYMENT_STATUS_ACTION
  | SET_STORING_STATUS_ACTION
  | SET_INDEXING_STATUS_ACTION
  | RESET_TO_INITIAL_STATE_ACTION;

type SET_STORING_STATUS_ACTION = {
  type: ActionType.SET_STORING_STATUS;
  payload: {
    IPFSCurrentStatus: ProgressStatus;
  };
};

type SET_INDEXING_STATUS_ACTION = {
  type: ActionType.SET_INDEXING_STATUS;
  payload: {
    indexingStatus: ProgressStatus;
  };
};

type SET_DEPLOYMENT_STATUS_ACTION = {
  type: ActionType.SET_DEPLOYMENT_STATUS;
  payload: {
    contractDeploymentStatus: ProgressStatus;
  };
};

type RESET_TO_INITIAL_STATE_ACTION = {
  type: ActionType.RESET_TO_INITIAL_STATE;
};

type Dispatch = (action: Action) => void;

enum ActionType {
  SET_STORING_STATUS = "SET_STORING_STATUS",
  SET_DEPLOYMENT_STATUS = "SET_DEPLOYMENT_STATUS",
  SET_INDEXING_STATUS = "SET_INDEXING_STATUS",
  RESET_TO_INITIAL_STATE = "RESET_TO_INITIAL_STATE",
}

export const initialCreateProgramState: CreateProgramState = {
  IPFSCurrentStatus: ProgressStatus.NOT_STARTED,
  contractDeploymentStatus: ProgressStatus.NOT_STARTED,
  indexingStatus: ProgressStatus.NOT_STARTED,
};

export const CreateProgramContext = createContext<
  { state: CreateProgramState; dispatch: Dispatch } | undefined
>(undefined);

const createProgramReducer = (state: CreateProgramState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_STORING_STATUS:
      return { ...state, IPFSCurrentStatus: action.payload.IPFSCurrentStatus };
    case ActionType.SET_DEPLOYMENT_STATUS:
      return {
        ...state,
        contractDeploymentStatus: action.payload.contractDeploymentStatus,
      };
    case ActionType.SET_INDEXING_STATUS:
      return {
        ...state,
        indexingStatus: action.payload.indexingStatus,
      };
    case ActionType.RESET_TO_INITIAL_STATE: {
      return initialCreateProgramState;
    }
  }
  return state;
};

export const CreateProgramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    createProgramReducer,
    initialCreateProgramState
  );

  const providerProps = {
    state,
    dispatch,
  };

  return (
    <CreateProgramContext.Provider value={providerProps}>
      {children}
    </CreateProgramContext.Provider>
  );
};

export const useCreateProgram = () => {
  const context = useContext(CreateProgramContext);
  if (context === undefined) {
    throw new Error("useCreateProgram must be used within a ProgramProvider");
  }

  const { dispatch } = context;

  const allo = useAllo();

  const createProgram = async (
    programName: string,
    operatorWallets: string[]
  ) => {
    dispatch({
      type: ActionType.RESET_TO_INITIAL_STATE,
    });
    try {
      const metadata = {
        type: "program",
        name: programName,
      };

      const transactionBlockNumber = await deployContract(
        dispatch,
        metadata,
        operatorWallets,
        signerOrProvider
      );

      await waitForSubgraphToUpdate(
        dispatch,
        signerOrProvider,
        transactionBlockNumber
      );
    } catch (error) {
      datadogLogs.logger.error(`error: _createProgram - ${error}`);
      console.error("_createProgram: ", error);
    }
  };

  return {
    createProgram,
    IPFSCurrentStatus: context.state.IPFSCurrentStatus,
    contractDeploymentStatus: context.state.contractDeploymentStatus,
    indexingStatus: context.state.indexingStatus,
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
      content: { type: "program", name: programName },
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

async function deployContract(
  dispatch: (action: Action) => void,
  metadata: { protocol: number; pointer: string },
  operatorWallets: string[],
  signerOrProvider: Web3Instance["provider"]
) {
  try {
    dispatch({
      type: ActionType.SET_DEPLOYMENT_STATUS,
      payload: { contractDeploymentStatus: ProgressStatus.IN_PROGRESS },
    });

    const { transactionBlockNumber } = await deployProgramContract({
      program: { store: metadata, operatorWallets },
      // @ts-expect-error TODO: resolve this situation around signers and providers
      signerOrProvider: signerOrProvider,
    });

    dispatch({
      type: ActionType.SET_DEPLOYMENT_STATUS,
      payload: { contractDeploymentStatus: ProgressStatus.IS_SUCCESS },
    });

    return transactionBlockNumber;
  } catch (error) {
    datadogLogs.logger.error(`error: deployContract - ${error}`);
    console.error(`deployContract`, error);
    dispatch({
      type: ActionType.SET_DEPLOYMENT_STATUS,
      payload: { contractDeploymentStatus: ProgressStatus.IS_ERROR },
    });

    throw error;
  }
}

async function waitForSubgraphToUpdate(
  dispatch: (action: Action) => void,
  signerOrProvider: Web3Instance["provider"],
  transactionBlockNumber: number
) {
  try {
    datadogLogs.logger.error(
      `waitForSubgraphToUpdate: txnBlockNumber - ${transactionBlockNumber}`
    );

    dispatch({
      type: ActionType.SET_INDEXING_STATUS,
      payload: { indexingStatus: ProgressStatus.IN_PROGRESS },
    });

    // @ts-expect-error TODO: resolve this situation around signers and providers
    const chainId = await signerOrProvider.getChainId();

    await waitForSubgraphSyncTo(chainId, transactionBlockNumber);

    dispatch({
      type: ActionType.SET_INDEXING_STATUS,
      payload: { indexingStatus: ProgressStatus.IS_SUCCESS },
    });
  } catch (error) {
    datadogLogs.logger.error(
      `error: waitForSubgraphToUpdate - ${error}. Data - ${transactionBlockNumber}`
    );
    console.error(`waitForSubgraphToUpdate`, error);
    dispatch({
      type: ActionType.SET_INDEXING_STATUS,
      payload: { indexingStatus: ProgressStatus.IS_ERROR },
    });
    throw error;
  }
}
