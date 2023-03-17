import React, { createContext, useContext, useReducer } from "react";

import { ProgressStatus } from "../../features/api/types";

export interface FundContractState {
  tokenApprovalStatus: ProgressStatus;
  fundStatus: ProgressStatus;
  indexingStatus: ProgressStatus;
  txHash: string;
}

type Action =
  | SET_TOKEN_APPROVAL_STATUS_ACTION
  | SET_FUND_STATUS_ACTION
  | SET_INDEXING_STATUS_ACTION
  | SET_TX_HASH_ACTION
  | RESET_TO_INITIAL_STATE_ACTION;

type SET_TOKEN_APPROVAL_STATUS_ACTION = {
  type: ActionType.SET_TOKEN_APPROVAL_STATUS;
  payload: {
    tokenApprovalStatus: ProgressStatus;
  };
};

type SET_FUND_STATUS_ACTION = {
  type: ActionType.SET_FUND_STATUS;
  payload: {
    fundStatus: ProgressStatus;
  };
};

type SET_INDEXING_STATUS_ACTION = {
  type: ActionType.SET_INDEXING_STATUS;
  payload: {
    indexingStatus: ProgressStatus;
  };
};

type SET_TX_HASH_ACTION = {
  type: ActionType.SET_TX_HASH;
  payload: {
    txHash: string;
  };
};

type RESET_TO_INITIAL_STATE_ACTION = {
  type: ActionType.RESET_TO_INITIAL_STATE;
};

type Dispatch = (action: Action) => void;

enum ActionType {
  SET_TOKEN_APPROVAL_STATUS = "SET_TOKEN_APPROVAL_STATUS",
  SET_FUND_STATUS = "SET_FUND_STATUS",
  SET_INDEXING_STATUS = "SET_INDEXING_STATUS",
  SET_TX_HASH = "SET_TX_HASH",
  RESET_TO_INITIAL_STATE = "RESET_TO_INITIAL_STATE",
}

export const initialFundContractState: FundContractState = {
  tokenApprovalStatus: ProgressStatus.NOT_STARTED,
  fundStatus: ProgressStatus.NOT_STARTED,
  indexingStatus: ProgressStatus.NOT_STARTED,
  txHash: "",
};

export const FundContractContext = createContext<
  { state: FundContractState; dispatch: Dispatch } | undefined
>(undefined);

const fundContractReducer = (state: FundContractState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_TOKEN_APPROVAL_STATUS:
      return {
        ...state,
        tokenApprovalStatus: action.payload.tokenApprovalStatus,
      };
    case ActionType.SET_FUND_STATUS:
      return { ...state, fundStatus: action.payload.fundStatus };
    case ActionType.SET_INDEXING_STATUS:
      return { ...state, indexingStatus: action.payload.indexingStatus };
    case ActionType.SET_TX_HASH:
      return { ...state, txHash: action.payload.txHash };
    case ActionType.RESET_TO_INITIAL_STATE: {
      return initialFundContractState;
    }
  }
};

export const FundContractProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    fundContractReducer,
    initialFundContractState
  );

  const providerProps = {
    state,
    dispatch,
  };

  return (
    <FundContractContext.Provider value={providerProps}>
      {children}
    </FundContractContext.Provider>
  );
};

export const useFundContract = () => {
  const context = useContext(FundContractContext);
  if (context === undefined) {
    throw new Error(
      "useFundContract must be used within a FundContractProvider"
    );
  }

  // const { signer: walletSigner } = useWallet();

  const submitDonations = async () =>
    //dispatch: (action: Action) => void
    {
      console.error("submitDonations: not implemented");
    };

  return {
    submitDonations,
    tokenApprovalStatus: context.state.tokenApprovalStatus,
    fundStatus: context.state.fundStatus,
    indexingStatus: context.state.indexingStatus,
    txHash: context.state.txHash,
  };
};
