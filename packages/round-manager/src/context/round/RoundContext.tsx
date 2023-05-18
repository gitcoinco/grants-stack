import { ProgressStatus, Round } from "../../features/api/types";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { getRoundById, listRounds } from "../../features/api/round";
import { datadogLogs } from "@datadog/browser-logs";
import { PublicClient } from "viem";
import { useAccount, useChainId, usePublicClient } from "wagmi";

export interface RoundState {
  data: Round[];
  fetchRoundStatus: ProgressStatus;
  error?: Error;
}

enum ActionType {
  SET_ROUNDS = "set-rounds",
  SET_LIST_ROUNDS_ERROR = "set-list-rounds-error",
  SET_FETCH_ROUNDS_STATUS = "set-fetch-rounds-status",
}

interface Action {
  type: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

type Dispatch = (action: Action) => void;

export const initialRoundState: RoundState = {
  data: [],
  fetchRoundStatus: ProgressStatus.NOT_STARTED,
};

export const RoundContext = createContext<
  { state: RoundState; dispatch: Dispatch } | undefined
>(undefined);

const fetchRounds = async (
  dispatch: Dispatch,
  address: string,
  publicClient: PublicClient,
  programId: string
) => {
  datadogLogs.logger.info(`fetchRounds: program - ${programId}`);

  dispatch({
    type: ActionType.SET_FETCH_ROUNDS_STATUS,
    payload: ProgressStatus.IN_PROGRESS,
  });

  try {
    const { rounds } = await listRounds(address, publicClient, programId);
    dispatch({ type: ActionType.SET_ROUNDS, payload: rounds });
    dispatch({
      type: ActionType.SET_FETCH_ROUNDS_STATUS,
      payload: ProgressStatus.IS_SUCCESS,
    });
  } catch (error) {
    datadogLogs.logger.error(`error: fetchRounds ${error}`);
    console.error("fetchRounds", error);

    dispatch({ type: ActionType.SET_LIST_ROUNDS_ERROR, payload: error });
    dispatch({
      type: ActionType.SET_FETCH_ROUNDS_STATUS,
      payload: ProgressStatus.IS_ERROR,
    });
  }
};

const fetchRoundById = async (
  dispatch: Dispatch,
  roundId: string,
  publicClient: PublicClient
) => {
  datadogLogs.logger.info(`fetchRoundById: round - ${roundId}`);

  dispatch({
    type: ActionType.SET_FETCH_ROUNDS_STATUS,
    payload: ProgressStatus.IN_PROGRESS,
  });

  try {
    const round = await getRoundById(publicClient, roundId);
    dispatch({ type: ActionType.SET_ROUNDS, payload: [round] });
    dispatch({
      type: ActionType.SET_FETCH_ROUNDS_STATUS,
      payload: ProgressStatus.IS_SUCCESS,
    });
  } catch (error) {
    datadogLogs.logger.error(`error: fetchRoundById ${error}`);
    console.error("fetchRoundById", error);
    dispatch({ type: ActionType.SET_LIST_ROUNDS_ERROR, payload: error });
    dispatch({
      type: ActionType.SET_FETCH_ROUNDS_STATUS,
      payload: ProgressStatus.IS_ERROR,
    });
  }
};

const roundReducer = (state: RoundState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_ROUNDS:
      return {
        ...state,
        data: action.payload ?? [],
        error: undefined,
      };
    case ActionType.SET_LIST_ROUNDS_ERROR:
      return {
        ...state,
        data: [],
        error: action.payload,
      };
    case ActionType.SET_FETCH_ROUNDS_STATUS:
      return {
        ...state,
        fetchRoundStatus: action.payload,
      };
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
  const { address } = useAccount();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (programId) {
      fetchRounds(context.dispatch, address ?? "", publicClient, programId);
    }
  }, [address, publicClient, programId, context.dispatch]);

  return { ...context.state, dispatch: context.dispatch };
};

export const useRoundById = (roundId?: string) => {
  const context = useContext(RoundContext);
  if (context === undefined) {
    throw new Error("useRounds must be used within a RoundProvider");
  }
  const chainId = useChainId();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (roundId) {
      const existingRound = context.state.data.find(
        (round) => round.id === roundId && round.chainId === chainId
      );

      if (!existingRound?.token) {
        fetchRoundById(context.dispatch, roundId, publicClient);
      }
    }
  }, [publicClient, roundId, context.dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const round = context.state.data.find((round) => round.id === roundId);
  return {
    round,
    fetchRoundStatus: context.state.fetchRoundStatus,
    error: context.state.error,
  };
};
