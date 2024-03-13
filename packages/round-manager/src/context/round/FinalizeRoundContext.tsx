import { ProgressStatus } from "../../features/api/types";
import React, { createContext, useContext, useReducer } from "react";
import { useAllo } from "common";
import { Address } from "viem";
import { DistributionMatch } from "data-layer";

export interface FinalizeRoundState {
  IPFSCurrentStatus: ProgressStatus;
  finalizeRoundToContractStatus: ProgressStatus;
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

export const useFinalizeRound = () => {
  const context = useContext(FinalizeRoundContext);
  const allo = useAllo();

  if (context === undefined) {
    throw new Error(
      "useFinalizeRound must be used within a FinalizeRoundProvider"
    );
  }

  const finalizeRound = async (
    roundId: string,
    payoutStrategy: string,
    matchingJSON: DistributionMatch[]
  ) => {
    if (allo === null) {
      return;
    }

    context.dispatch({
      type: ActionType.RESET_TO_INITIAL_STATE,
    });
    context.dispatch({
      type: ActionType.SET_STORING_STATUS,
      payload: { IPFSCurrentStatus: ProgressStatus.IN_PROGRESS },
    });

    const result = await allo
      .finalizeRound({
        roundId,
        strategyAddress: payoutStrategy as Address,
        matchingDistribution: matchingJSON,
      })
      .on("ipfs", (result) => {
        if (result.type === "error") {
          context.dispatch({
            type: ActionType.SET_STORING_STATUS,
            payload: { IPFSCurrentStatus: ProgressStatus.IS_ERROR },
          });
        } else {
          context.dispatch({
            type: ActionType.SET_STORING_STATUS,
            payload: { IPFSCurrentStatus: ProgressStatus.IS_SUCCESS },
          });

          context.dispatch({
            type: ActionType.SET_DEPLOYMENT_STATUS,
            payload: {
              finalizeRoundToContractStatus: ProgressStatus.IN_PROGRESS,
            },
          });
        }
      })
      .on("transaction", (result) => {
        if (result.type === "error") {
          context.dispatch({
            type: ActionType.SET_DEPLOYMENT_STATUS,
            payload: {
              finalizeRoundToContractStatus: ProgressStatus.IS_ERROR,
            },
          });
        }
      })
      .on("transactionStatus", (result) => {
        if (result.type === "error") {
          context.dispatch({
            type: ActionType.SET_DEPLOYMENT_STATUS,
            payload: {
              finalizeRoundToContractStatus: ProgressStatus.IS_ERROR,
            },
          });
        }
      })
      .on("indexingStatus", (result) => {
        if (result.type === "error") {
          context.dispatch({
            type: ActionType.SET_DEPLOYMENT_STATUS,
            payload: {
              finalizeRoundToContractStatus: ProgressStatus.IS_ERROR,
            },
          });
        } else {
          context.dispatch({
            type: ActionType.SET_DEPLOYMENT_STATUS,
            payload: {
              finalizeRoundToContractStatus: ProgressStatus.IS_SUCCESS,
            },
          });
        }
      })
      .execute();

    if (result.type === "error") {
      throw result.error;
    }
  };

  return {
    finalizeRound,
    IPFSCurrentStatus: context.state.IPFSCurrentStatus,
    finalizeRoundToContractStatus: context.state.finalizeRoundToContractStatus,
  };
};
