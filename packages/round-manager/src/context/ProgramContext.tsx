import { Program } from "../features/api/types";
import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
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
  START_LOADING = "start-loading",
  FINISH_LOADING = "finish-loading",
  SET_PROGRAMS = "set-programs",
  SET_LIST_PROGRAMS_ERROR = "set-list-programs-error",
  ADD_PROGRAM = "add-program",
  SET_GET_PROGRAM_ERROR = "SET_GET_PROGRAM_ERROR",
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

const fetchProgramsById = async (dispatch: Dispatch, programId: string, walletProvider: any) => {
  dispatch({type: ActionType.START_LOADING});
  getProgramById(programId, walletProvider)
    .then(program => dispatch({type: ActionType.ADD_PROGRAM, payload: program}))
    .catch(error => dispatch({type: ActionType.SET_GET_PROGRAM_ERROR, payload: error}))
    .finally(() => dispatch({type: ActionType.FINISH_LOADING}))
};

const programReducer = (state: ProgramState, action: Action) => {
  switch (action.type) {
    case ActionType.START_LOADING:
      return { ...state, isLoading: true };
    case ActionType.FINISH_LOADING:
      return { ...state, isLoading: false };
    case ActionType.SET_PROGRAMS:
      return { ...state, programs: action.payload ?? [], listProgramsError: undefined };
    case ActionType.SET_LIST_PROGRAMS_ERROR:
      return { ...state, programs: [], listProgramsError: action.payload };
    case ActionType.ADD_PROGRAM:
      return { ...state, programs: state.programs.concat(action.payload), getProgramByIdError: undefined }
    case ActionType.SET_GET_PROGRAM_ERROR:
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

  const { address, provider: walletProvider } = useWallet()

  useEffect(() => {
    fetchProgramsByAddress(context.dispatch, address, walletProvider);
  }, [address, walletProvider])

  return { ...context.state, dispatch: context.dispatch };
};

export const useProgramById = (id?: string): { program: Program | undefined, isLoading: boolean, getProgramByIdError?: Error } => {
  // const {programs, isLoading, dispatch} = usePrograms()
  const context = useContext(ProgramContext)
  if (context === undefined) {
    throw new Error("useProgramById must be used within a ProgramProvider");
  }

  const { provider: walletProvider } = useWallet()
  useEffect(() => {
    if (id) {
      // TODO(shavinac) - don't need to do a new fetch if program is already in context
      fetchProgramsById(context.dispatch, id, walletProvider)
    }
  },[id, walletProvider])

  return {
    program: context.state.programs.find(program => program.id === id),
    isLoading: context.state.isLoading,
    getProgramByIdError: context.state.getProgramByIdError
  }
}

// export const useProgramById = (provider: any, id?: string): { programToRender?: Program, programIsLoading: boolean } => {
//   const [programToRender, setProgramToRender] = useState<Program>()
//   const [programIsLoading, setProgramIsLoading] = useState(true)
//
//   useEffect(() => {
//     const fetchProgramToRender = async () => {
//       if (id) {
//         const program = await getProgramById(id, provider)
//         setProgramToRender(program)
//         setProgramIsLoading(false)
//       }
//     }
//     setProgramIsLoading(true)
//     fetchProgramToRender()
//       .catch(() => {
//         setProgramToRender(undefined)
//         setProgramIsLoading(false)
//       })
//   },[id, provider])
//
//   return {programToRender, programIsLoading}
// }
