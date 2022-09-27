import { Round } from "../features/api/types";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useWallet } from "../features/common/Auth";
import { getRoundById, listRounds } from "../features/api/round";
import { Web3Provider } from "@ethersproject/providers";

export interface RoundState {
  data: Round[];
  isLoading: boolean;
  error?: Error;
}

enum ActionType {
  START_LOADING = "start-loading",
  FINISH_LOADING = "finish-loading",
  SET_ROUNDS = "set-rounds",
  SET_LIST_ROUNDS_ERROR = "set-list-rounds-error",
}

interface Action {
  type: ActionType;
  payload?: any;
}

type Dispatch = (action: Action) => void;

export const initialRoundState: RoundState = {
  data: [],
  isLoading: false,
};

export const RoundContext = createContext<
  { state: RoundState; dispatch: Dispatch } | undefined
>(undefined);

const fetchRounds = async (
  dispatch: Dispatch,
  address: string,
  walletProvider: Web3Provider,
  programId: string
) => {
  dispatch({ type: ActionType.START_LOADING });

  const res = await listRounds(address, walletProvider, programId);

  if (res.error) {
    dispatch({ type: ActionType.SET_LIST_ROUNDS_ERROR, payload: res.error });
  }
  dispatch({ type: ActionType.SET_ROUNDS, payload: res.data });
  dispatch({ type: ActionType.FINISH_LOADING });
};

const fetchRoundById = (
  dispatch: Dispatch,
  walletProvider: Web3Provider,
  roundId: string
) => {
  dispatch({ type: ActionType.START_LOADING });

  getRoundById(walletProvider, roundId)
    .then((round) =>
      dispatch({ type: ActionType.SET_ROUNDS, payload: [round] })
    )
    .catch((error) =>
      dispatch({ type: ActionType.SET_LIST_ROUNDS_ERROR, payload: error })
    )
    .finally(() => dispatch({ type: ActionType.FINISH_LOADING }));
};

const roundReducer = (state: RoundState, action: Action) => {
  switch (action.type) {
    case ActionType.START_LOADING:
      return { ...state, isLoading: true };
    case ActionType.FINISH_LOADING:
      return { ...state, isLoading: false };
    case ActionType.SET_ROUNDS:
      return { ...state, data: action.payload ?? [] };
    case ActionType.SET_LIST_ROUNDS_ERROR:
      return { ...state, data: [], error: action.payload };
  }
};

export const RoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(roundReducer, initialRoundState);

  const providerProps = {
    state,
    dispatch,
  };

  return (
    <RoundContext.Provider value={providerProps}>
      {children}
    </RoundContext.Provider>
  );
};

export const useRounds = (programId?: string) => {
  const context = useContext(RoundContext);
  if (context === undefined) {
    throw new Error("useRounds must be used within a RoundProvider");
  }
  const { address, provider } = useWallet();

  useEffect(() => {
    if (programId) {
      fetchRounds(context.dispatch, address, provider, programId);
    }
  }, [address, provider, programId, context.dispatch]);

  return { ...context.state, dispatch: context.dispatch };
};

export const useRoundById = (roundId?: string) => {
  const context = useContext(RoundContext);
  if (context === undefined) {
    throw new Error("useRounds must be used within a RoundProvider");
  }
  const { address, provider } = useWallet();

  useEffect(() => {
    if (roundId) {
      const existingRound = context.state.data.find(
        (round) => round.id === roundId
      );

      if (!existingRound) {
        fetchRoundById(context.dispatch, provider, roundId);
      }
    }
  }, [address, provider, roundId, context.dispatch]);

  return {
    round: context.state.data.find((round) => round.id === roundId),
    isLoading: context.state.isLoading,
    error: context.state.error,
  };
};
