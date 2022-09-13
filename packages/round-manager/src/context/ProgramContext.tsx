import { Program } from "../features/api/types";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useWallet } from "../features/common/Auth";
import { getProgramById, listPrograms } from "../features/api/program";
import { Web3Provider } from "@ethersproject/providers";

export interface ProgramState {
  programs: Program[];
  isLoading: boolean;
  listProgramsError?: Error;
  getProgramByIdError?: Error;
}

// TODO match value <-> name
enum ActionType {
  SET_LOADING = "SET_LOADING",
  FINISH_LOADING = "FINISH_LOADING",
  SET_PROGRAMS = "SET_PROGRAMS",
  SET_ERROR_LIST_PROGRAMS = "SET_ERROR_LIST_PROGRAMS",
  ADD_PROGRAM = "ADD_PROGRAM",
  SET_ERROR_GET_PROGRAM = "SET_ERROR_GET_PROGRAM",
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

const fetchProgramsByAddress = async (
  dispatch: Dispatch,
  address: string,
  walletProvider: Web3Provider
) => {
  dispatch({ type: ActionType.SET_LOADING, payload: true });
  listPrograms(address, walletProvider)
    .then((programs) =>
      dispatch({ type: ActionType.SET_PROGRAMS, payload: programs })
    )
    .catch((error) =>
      dispatch({ type: ActionType.SET_ERROR_LIST_PROGRAMS, payload: error })
    )
    .finally(() => dispatch({ type: ActionType.FINISH_LOADING }));
};

const fetchProgramsById = async (
  dispatch: Dispatch,
  programId: string,
  walletProvider: any
) => {
  dispatch({ type: ActionType.SET_LOADING, payload: true });
  getProgramById(programId, walletProvider)
    .then((program) =>
      dispatch({ type: ActionType.ADD_PROGRAM, payload: program })
    )
    .catch((error) =>
      dispatch({ type: ActionType.SET_ERROR_GET_PROGRAM, payload: error })
    )
    .finally(() => dispatch({ type: ActionType.FINISH_LOADING }));
};

const programReducer = (state: ProgramState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionType.FINISH_LOADING:
      return { ...state, isLoading: false };
    case ActionType.SET_PROGRAMS:
      return {
        ...state,
        programs: action.payload ?? [],
        listProgramsError: undefined,
      };
    case ActionType.SET_ERROR_LIST_PROGRAMS:
      return { ...state, programs: [], listProgramsError: action.payload };
    case ActionType.ADD_PROGRAM:
      return {
        ...state,
        programs: state.programs.concat(action.payload),
        getProgramByIdError: undefined,
      };
    case ActionType.SET_ERROR_GET_PROGRAM:
      return { ...state, getProgramByIdError: action.payload };
  }
  return state;
};

export const ProgramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(programReducer, initialProgramState);

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

export const usePrograms = (): ProgramState & { dispatch: Dispatch } => {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error("usePrograms must be used within a ProgramProvider");
  }

  const { address, provider: walletProvider } = useWallet();

  useEffect(() => {
    fetchProgramsByAddress(context.dispatch, address, walletProvider);
  }, [address, walletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...context.state, dispatch: context.dispatch };
};

export const useProgramById = (
  id?: string
): {
  program: Program | undefined;
  isLoading: boolean;
  getProgramByIdError?: Error;
} => {
  // const {programs, isLoading, dispatch} = usePrograms()
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error("useProgramById must be used within a ProgramProvider");
  }

  const { provider: walletProvider } = useWallet();
  useEffect(() => {
    if (id) {
      // TODO(shavinac) - don't need to do a new fetch if program is already in context
      fetchProgramsById(context.dispatch, id, walletProvider);
    }
  }, [id, walletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    program: context.state.programs.find((program) => program.id === id),
    isLoading: context.state.isLoading,
    getProgramByIdError: context.state.getProgramByIdError,
  };
};
