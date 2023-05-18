import { Program, ProgressStatus } from "../../features/api/types";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { getProgramById, listPrograms } from "../../features/api/program";
import { datadogLogs } from "@datadog/browser-logs";
import { PublicClient } from "viem";
import { useAccount, usePublicClient } from "wagmi";

export interface ReadProgramState {
  programs: Program[];
  fetchProgramsStatus: ProgressStatus;
  listProgramsError?: Error;
  getProgramByIdError?: Error;
}

enum ActionType {
  SET_FETCH_PROGRAM_STATUS = "SET_FETCH_PROGRAM_STATUS",
  FINISH_LOADING = "FINISH_LOADING",
  SET_PROGRAMS = "SET_PROGRAMS",
  SET_ERROR_LIST_PROGRAMS = "SET_ERROR_LIST_PROGRAMS",
  SET_ERROR_GET_PROGRAM = "SET_ERROR_GET_PROGRAM",
}

interface Action {
  type: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

type Dispatch = (action: Action) => void;

export type ProgramContextType =
  | { state: ReadProgramState; dispatch: Dispatch }
  | undefined;

export const initialReadProgramState: ReadProgramState = {
  programs: [],
  fetchProgramsStatus: ProgressStatus.NOT_STARTED,
};
export const ReadProgramContext = createContext<ProgramContextType>(undefined);

const fetchProgramsByAddress = async (
  dispatch: Dispatch,
  address: string,
  publicClient: PublicClient
) => {
  datadogLogs.logger.info(`fetchProgramsByAddress: address - ${address}`);

  dispatch({
    type: ActionType.SET_FETCH_PROGRAM_STATUS,
    payload: ProgressStatus.IN_PROGRESS,
  });
  try {
    const programs = await listPrograms(address, publicClient);
    dispatch({ type: ActionType.SET_PROGRAMS, payload: programs });
    dispatch({
      type: ActionType.SET_FETCH_PROGRAM_STATUS,
      payload: ProgressStatus.IS_SUCCESS,
    });
  } catch (error) {
    datadogLogs.logger.error(`error: fetchProgramsByAddress ${error}`);
    console.error(`fetchProgramsByAddress`, error);

    dispatch({ type: ActionType.SET_ERROR_LIST_PROGRAMS, payload: error });
    dispatch({
      type: ActionType.SET_FETCH_PROGRAM_STATUS,
      payload: ProgressStatus.IS_ERROR,
    });
  }
};

const fetchProgramsById = async (
  dispatch: Dispatch,
  programId: string,
  publicClient: PublicClient
) => {
  datadogLogs.logger.info(`fetchProgramsById: programId - ${programId}`);

  dispatch({
    type: ActionType.SET_FETCH_PROGRAM_STATUS,
    payload: ProgressStatus.IN_PROGRESS,
  });
  try {
    const program = await getProgramById(programId, publicClient);
    dispatch({ type: ActionType.SET_PROGRAMS, payload: [program] });
    dispatch({
      type: ActionType.SET_FETCH_PROGRAM_STATUS,
      payload: ProgressStatus.IS_SUCCESS,
    });
  } catch (error) {
    datadogLogs.logger.error(`error: fetchProgramsById ${error}`);
    console.error(`fetchProgramsById`, error);

    dispatch({ type: ActionType.SET_ERROR_GET_PROGRAM, payload: error });
    dispatch({
      type: ActionType.SET_FETCH_PROGRAM_STATUS,
      payload: ProgressStatus.IS_ERROR,
    });
  }
};

const programReducer = (state: ReadProgramState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_FETCH_PROGRAM_STATUS:
      return { ...state, fetchProgramsStatus: action.payload };
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
    case ActionType.SET_ERROR_GET_PROGRAM:
      return { ...state, getProgramByIdError: action.payload };
    default:
      return state;
  }
};

export const ReadProgramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(programReducer, initialReadProgramState);

  const providerProps = {
    state,
    dispatch,
  };

  return (
    <ReadProgramContext.Provider value={providerProps}>
      {children}
    </ReadProgramContext.Provider>
  );
};

export const usePrograms = (): ReadProgramState & { dispatch: Dispatch } => {
  const context = useContext(ReadProgramContext);
  if (context === undefined) {
    throw new Error("usePrograms must be used within a ProgramProvider");
  }

  const publicClient = usePublicClient();
  const { address } = useAccount();

  useEffect(() => {
    fetchProgramsByAddress(context.dispatch, address ?? "", publicClient);
  }, [address, publicClient]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...context.state, dispatch: context.dispatch };
};

export const useProgramById = (
  id?: string
): {
  program: Program | undefined;
  fetchProgramsStatus: ProgressStatus;
  getProgramByIdError?: Error;
} => {
  const context = useContext(ReadProgramContext);
  if (context === undefined) {
    throw new Error("useProgramById must be used within a ProgramProvider");
  }

  const publicClient = usePublicClient();

  useEffect(() => {
    if (id) {
      const existingProgram = context.state.programs.find(
        (program) => program.id === id
      );

      if (!existingProgram) {
        fetchProgramsById(context.dispatch, id, publicClient);
      }
    }
  }, [id, publicClient]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    program: context.state.programs.find((program) => program.id === id),
    fetchProgramsStatus: context.state.fetchProgramsStatus,
    getProgramByIdError: context.state.getProgramByIdError,
  };
};
