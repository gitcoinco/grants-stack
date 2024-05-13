import {
  Program,
  ProgressStatus,
  Web3Instance,
} from "../../features/api/types";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useWallet } from "../../features/common/Auth";
import { getProgramById, listPrograms } from "../../features/api/program";
import { datadogLogs } from "@datadog/browser-logs";
import { Web3Provider } from "@ethersproject/providers";
import { DataLayer, useDataLayer } from "data-layer";
import { useAlloVersion } from "common/src/components/AlloVersionSwitcher";

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
  dataLayer: DataLayer,
  walletProvider: Web3Instance["provider"]
) => {
  datadogLogs.logger.info(`fetchProgramsByAddress: address - ${address}`);

  dispatch({
    type: ActionType.SET_FETCH_PROGRAM_STATUS,
    payload: ProgressStatus.IN_PROGRESS,
  });
  try {
    const programs = await listPrograms(address, walletProvider, dataLayer);
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
  address: string,
  programId: string,
  dataLayer: DataLayer,
  walletProvider: Web3Provider
) => {
  datadogLogs.logger.info(`fetchProgramsById: programId - ${programId}`);

  dispatch({
    type: ActionType.SET_FETCH_PROGRAM_STATUS,
    payload: ProgressStatus.IN_PROGRESS,
  });
  try {
    const program = await getProgramById(programId, walletProvider, dataLayer);
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

  const { address, provider: walletProvider } = useWallet();
  const dataLayer = useDataLayer();

  useEffect(() => {
    fetchProgramsByAddress(
      context.dispatch,
      address.toLowerCase(),
      dataLayer,
      walletProvider
    );
  }, [address, walletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const { switchToVersion, version } = useAlloVersion();
  const dataLayer = useDataLayer();
  if (context === undefined) {
    throw new Error("useProgramById must be used within a ProgramProvider");
  }

  const { address, provider: walletProvider } = useWallet();

  useEffect(() => {
    if (id) {
      const existingProgram = context.state.programs.find(
        (program) => program.id === id
      );

      if (!existingProgram) {
        fetchProgramsById(
          context.dispatch,
          address.toLowerCase(),
          id,
          dataLayer,
          walletProvider
        );
      }
    }
  }, [id, walletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  const program = context.state.programs.find((program) => program.id === id);

  useEffect(() => {
    if (program?.tags?.includes("allo-v2") && version === "allo-v1") {
      switchToVersion("allo-v2");
    }
  }, [program, switchToVersion, version]);

  return {
    program: program,
    fetchProgramsStatus: context.state.fetchProgramsStatus,
    getProgramByIdError: context.state.getProgramByIdError,
  };
};
