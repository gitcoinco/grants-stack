import { ProgressStatus, Web3Instance } from "../../features/api/types";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import React, { createContext, useContext, useReducer } from "react";
import { useWallet } from "../../features/common/Auth";
import { saveToIPFS } from "../../features/api/ipfs";
import { deployProgramContract } from "../../features/api/program";
import { datadogLogs } from "@datadog/browser-logs";

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

interface Action {
  type: ActionType;
  payload?: any;
}

type Dispatch = (action: Action) => void;

enum ActionType {
  SET_STORING_STATUS = "SET_STORING_STATUS",
  SET_DEPLOYMENT_STATUS = "SET_DEPLOYMENT_STATUS",
  SET_INDEXING_STATUS = "SET_INDEXING_STATUS",
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

const _createProgram = async ({
  dispatch,
  programName,
  operatorWallets,
  signerOrProvider,
}: _createProgramParams) => {
  try {
    const IpfsHash = await storeDocument(dispatch, programName);

    const metadata = {
      protocol: 1,
      pointer: IpfsHash,
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
    console.error("Error while creating program: ", error);
  }
};
export const useCreateProgram = () => {
  const context = useContext(CreateProgramContext);
  if (context === undefined) {
    throw new Error("useCreateProgram must be used within a ProgramProvider");
  }

  const { signer: walletSigner } = useWallet();

  const createProgram = (programName: string, operatorWallets: string[]) => {
    _createProgram({
      dispatch: context.dispatch,
      programName: programName,
      operatorWallets,
      signerOrProvider: walletSigner,
    });
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
      signerOrProvider: signerOrProvider,
    });

    dispatch({
      type: ActionType.SET_DEPLOYMENT_STATUS,
      payload: { contractDeploymentStatus: ProgressStatus.IS_SUCCESS },
    });

    return transactionBlockNumber;
  } catch (error) {
    datadogLogs.logger.error(`error: deployContract - ${error}`);
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
    dispatch({
      type: ActionType.SET_INDEXING_STATUS,
      payload: { indexingStatus: ProgressStatus.IS_ERROR },
    });
    throw error;
  }
}
