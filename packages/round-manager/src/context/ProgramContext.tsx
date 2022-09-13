import { Program } from "../features/api/types";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useWallet } from "../features/common/Auth";
import { listPrograms } from "../features/api/program";
import { Web3Provider } from "@ethersproject/providers";

export interface ProgramState {
  programs: Program[];
  isLoading: boolean;
  listProgramsError?: Error;
}

enum ActionType {
  START_LOADING = "start-loading",
  FINISH_LOADING = "finish-loading",
  SET_PROGRAMS = "set-programs",
  SET_LIST_PROGRAMS_ERROR = "set-list-programs-error",
}

interface Action {
  type: ActionType;
  payload?: any;
}

type Dispatch = (action: Action) => void;

export const initialProgramState: ProgramState = {
  programs: [],
  isLoading: false,
};
export const ProgramContext = createContext<
  { state: ProgramState; dispatch: Dispatch } | undefined
>(undefined);

const fetchPrograms = async (
  dispatch: Dispatch,
  address: string,
  walletProvider: Web3Provider
) => {
  dispatch({ type: ActionType.START_LOADING });
  listPrograms(address, walletProvider)
    .then((programs) =>
      dispatch({ type: ActionType.SET_PROGRAMS, payload: programs })
    )
    .catch((error) =>
      dispatch({ type: ActionType.SET_LIST_PROGRAMS_ERROR, payload: error })
    )
    .finally(() => dispatch({ type: ActionType.FINISH_LOADING }));
};

const programReducer = (state: ProgramState, action: Action) => {
  switch (action.type) {
    case ActionType.START_LOADING:
      return { ...state, isLoading: true };
    case ActionType.FINISH_LOADING:
      return { ...state, isLoading: false };
    case ActionType.SET_PROGRAMS:
      return { ...state, programs: action.payload ?? [] };
    case ActionType.SET_LIST_PROGRAMS_ERROR:
      return { ...state, programs: [], listProgramsError: action.payload };
  }
  return state;
};

export const ProgramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(programReducer, initialProgramState);

  const { address, provider: walletProvider } = useWallet();

  useEffect(() => {
    fetchPrograms(dispatch, address, walletProvider);
  }, [address, walletProvider]);

  const providerProps = {
    state,
    dispatch,
  };

  return (
    <ProgramContext.Provider value={providerProps}>
      {children}
    </ProgramContext.Provider>
  );
};

export const usePrograms = () => {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error("usePrograms must be used within a ProgramProvider");
  }

  return { ...context.state, dispatch: context.dispatch };
};
