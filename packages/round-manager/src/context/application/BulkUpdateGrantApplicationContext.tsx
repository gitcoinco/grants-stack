import {
  GrantApplication,
  ProgressStatus,
  Web3Instance,
} from "../../features/api/types";
import React, { createContext, useContext, useReducer } from "react";
import {
  updateApplicationList,
  updateRoundContract,
} from "../../features/api/application";
// import { saveToIPFS } from "../../features/api/ipfs";
import { datadogLogs } from "@datadog/browser-logs";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import { Signer } from "@ethersproject/abstract-signer";
import { useWallet } from "../../features/common/Auth";

export interface BulkUpdateGrantApplicationState {
  IPFSCurrentStatus: ProgressStatus;
  contractUpdatingStatus: ProgressStatus;
  indexingStatus: ProgressStatus;
}

export type BulkUpdateGrantApplicationParams = {
  roundId: string;
  applications: GrantApplication[];
};

export const initialBulkUpdateGrantApplicationState: BulkUpdateGrantApplicationState =
  {
    IPFSCurrentStatus: ProgressStatus.NOT_STARTED,
    contractUpdatingStatus: ProgressStatus.NOT_STARTED,
    indexingStatus: ProgressStatus.NOT_STARTED,
  };

type Dispatch = (action: Action) => void;

enum ActionType {
  SET_STORING_STATUS = "SET_STORING_STATUS",
  SET_CONTRACT_UPDATING_STATUS = "SET_CONTRACT_UPDATING_STATUS",
  SET_INDEXING_STATUS = "SET_INDEXING_STATUS",
}

interface Action {
  type: ActionType;
  payload?: any;
}

export const BulkUpdateGrantApplicationContext = createContext<
  { state: BulkUpdateGrantApplicationState; dispatch: Dispatch } | undefined
>(undefined);

export const BulkUpdateGrantApplicationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    bulkUpdateGrantApplicationReducer,
    initialBulkUpdateGrantApplicationState
  );

  const providerProps = {
    state,
    dispatch,
  };

  return (
    <BulkUpdateGrantApplicationContext.Provider value={providerProps}>
      {children}
    </BulkUpdateGrantApplicationContext.Provider>
  );
};

const bulkUpdateGrantApplicationReducer = (
  state: BulkUpdateGrantApplicationState,
  action: Action
) => {
  switch (action.type) {
    case ActionType.SET_STORING_STATUS:
      return { ...state, IPFSCurrentStatus: action.payload };
    case ActionType.SET_CONTRACT_UPDATING_STATUS:
      return {
        ...state,
        contractUpdatingStatus: action.payload,
      };
    case ActionType.SET_INDEXING_STATUS:
      return {
        ...state,
        indexingStatus: action.payload,
      };
  }
  return state;
};

interface _bulkUpdateGrantApplicationParams {
  dispatch: Dispatch;
  signer: Signer;
  params: BulkUpdateGrantApplicationParams;
}

async function _bulkUpdateGrantApplication({
  dispatch,
  signer,
  params,
}: _bulkUpdateGrantApplicationParams) {
  const { roundId, applications } = params;
  try {
    const newProjectsMetaPtr = await storeDocument({
      dispatch,
      signer,
      roundId,
      applications,
    });
    const transactionBlockNumber = await updateContract({
      dispatch,
      signer,
      roundId,
      newProjectsMetaPtr,
    });
    await waitForSubgraphToUpdate(dispatch, signer, transactionBlockNumber);
  } catch (error) {
    datadogLogs.logger.error(`error: _bulkUpdateGrantApplication - ${error}`);
    console.error("Error while bulk updating applications: ", error);
  }
}

export const useBulkUpdateGrantApplication = () => {
  const context = useContext(BulkUpdateGrantApplicationContext);

  if (context === undefined) {
    throw new Error(
      "useBulkUpdateGrantApplication must be used within a BulkUpdateGrantApplicationProvider"
    );
  }

  const { signer } = useWallet();

  const bulkUpdateGrantApplication = (
    params: BulkUpdateGrantApplicationParams
  ) => {
    _bulkUpdateGrantApplication({ dispatch: context.dispatch, signer, params });
  };

  return {
    bulkUpdateGrantApplication,
    IPFSCurrentStatus: context.state.IPFSCurrentStatus,
    contractUpdatingStatus: context.state.contractUpdatingStatus,
    indexingStatus: context.state.indexingStatus,
  };
};

interface StoreDocumentParams {
  dispatch: Dispatch;
  signer: Signer;
  roundId: string;
  applications: GrantApplication[];
}

const storeDocument = async ({
  dispatch,
  signer,
  roundId,
  applications,
}: StoreDocumentParams): Promise<string> => {
  try {
    dispatch({
      type: ActionType.SET_STORING_STATUS,
      payload: ProgressStatus.IN_PROGRESS,
    });
    // TODO pass in correct data
    // const ipfsHash = await saveToIPFS({});
    const chainId = await signer.getChainId();
    const ipfsHash = await updateApplicationList(
      applications,
      roundId,
      chainId
    );
    dispatch({
      type: ActionType.SET_STORING_STATUS,
      payload: ProgressStatus.IS_SUCCESS,
    });

    return ipfsHash;
  } catch (error) {
    datadogLogs.logger.error(`error: storeDocument - ${error}`);
    dispatch({
      type: ActionType.SET_STORING_STATUS,
      payload: ProgressStatus.IS_ERROR,
    });
    throw error;
  }
};

interface UpdateContractParams {
  dispatch: Dispatch;
  signer: Signer;
  roundId: string;
  newProjectsMetaPtr: string;
}

const updateContract = async ({
  dispatch,
  signer,
  roundId,
  newProjectsMetaPtr,
}: UpdateContractParams): Promise<number> => {
  try {
    dispatch({
      type: ActionType.SET_CONTRACT_UPDATING_STATUS,
      payload: ProgressStatus.IN_PROGRESS,
    });

    const { transactionBlockNumber } = await updateRoundContract(
      roundId,
      signer,
      newProjectsMetaPtr
    );

    dispatch({
      type: ActionType.SET_CONTRACT_UPDATING_STATUS,
      payload: ProgressStatus.IS_SUCCESS,
    });

    return transactionBlockNumber;
  } catch (error) {
    datadogLogs.logger.error(`error: updateContract - ${error}`);
    dispatch({
      type: ActionType.SET_CONTRACT_UPDATING_STATUS,
      payload: ProgressStatus.IS_ERROR,
    });
    throw error;
  }
};

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
      payload: ProgressStatus.IN_PROGRESS,
    });

    const chainId = await signerOrProvider.getChainId();

    await waitForSubgraphSyncTo(chainId, transactionBlockNumber);

    dispatch({
      type: ActionType.SET_INDEXING_STATUS,
      payload: ProgressStatus.IS_SUCCESS,
    });
  } catch (error) {
    datadogLogs.logger.error(
      `error: waitForSubgraphToUpdate - ${error}. Data - ${transactionBlockNumber}`
    );
    dispatch({
      type: ActionType.SET_INDEXING_STATUS,
      payload: ProgressStatus.IS_ERROR,
    });
    throw error;
  }
}
