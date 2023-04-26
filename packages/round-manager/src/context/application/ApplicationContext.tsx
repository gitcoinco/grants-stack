import React, { createContext, useContext, useEffect, useReducer } from "react";
import { GrantApplication } from "../../features/api/types";
import { useWallet } from "../../features/common/Auth";
import {
  getApplicationById,
  getApplicationsByRoundId,
} from "../../features/api/application";
import { Web3Provider } from "@ethersproject/providers";
import { datadogLogs } from "@datadog/browser-logs";

enum ActionType {
  SET_APPLICATION = "SET_APPLICATION",
  SET_ROUND_APPLICATIONS = "SET_ROUND_APPLICATIONS",
  SET_LOADING = "SET_LOADING",
  SET_ERROR_GET_APPLICATION = "SET_ERROR_GET_APPLICATION",
  SET_ERROR_GET_ROUND_APPLICATIONS = "SET_ERROR_GET_ROUND_APPLICATIONS",
}

type Action =
  | SET_APPLICATION_ACTION
  | SET_ROUND_APPLICATIONS_ACTION
  | SET_LOADING_ACTION
  | SET_ERROR_GET_APPLICATION_ACTION
  | SET_ERROR_GET_ROUND_APPLICATIONS_ACTION;

type SET_APPLICATION_ACTION = {
  type: ActionType.SET_APPLICATION;
  payload: GrantApplication;
};

type SET_ROUND_APPLICATIONS_ACTION = {
  type: ActionType.SET_ROUND_APPLICATIONS;
  payload: GrantApplication[];
};

type SET_LOADING_ACTION = {
  type: ActionType.SET_LOADING;
  payload: boolean;
};

type SET_ERROR_GET_APPLICATION_ACTION = {
  type: ActionType.SET_ERROR_GET_APPLICATION;
  payload: Error;
};

type SET_ERROR_GET_ROUND_APPLICATIONS_ACTION = {
  type: ActionType.SET_ERROR_GET_ROUND_APPLICATIONS;
  payload: Error;
};

type Dispatch = (action: Action) => void;

export interface ApplicationState {
  applications: GrantApplication[];
  isLoading: boolean;
  getApplicationByIdError?: Error;
  getApplicationByRoundIdError?: Error;
}

export const ApplicationContext = createContext<
  { state: ApplicationState; dispatch: Dispatch } | undefined
>(undefined);

const applicationReducer = (
  state: ApplicationState,
  action: Action
): ApplicationState => {
  switch (action.type) {
    case ActionType.SET_APPLICATION:
      return {
        ...state,
        applications: [action.payload],
        getApplicationByIdError: undefined,
      };
    case ActionType.SET_ROUND_APPLICATIONS:
      return {
        ...state,
        applications: action.payload,
        getApplicationByRoundIdError: undefined,
      };
    case ActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case ActionType.SET_ERROR_GET_APPLICATION:
      return {
        ...state,
        getApplicationByIdError: action.payload,
      };
    case ActionType.SET_ERROR_GET_ROUND_APPLICATIONS:
      return {
        ...state,
        applications: [],
        getApplicationByRoundIdError: action.payload,
      };
    default:
      return state;
  }
};

export const initialApplicationState: ApplicationState = {
  applications: [],
  isLoading: false,
};

export const ApplicationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    applicationReducer,
    initialApplicationState
  );

  const providerProps = {
    state,
    dispatch,
  };

  return (
    <ApplicationContext.Provider value={providerProps}>
      {children}
    </ApplicationContext.Provider>
  );
};

function fetchApplicationById(
  dispatch: Dispatch,
  id: string,
  walletProvider: Web3Provider
) {
  datadogLogs.logger.info(`fetchApplicationById: id - ${id}`);

  dispatch({ type: ActionType.SET_LOADING, payload: true });
  getApplicationById(id, walletProvider)
    .then((application) => {
      dispatch({ type: ActionType.SET_APPLICATION, payload: application });
    })
    .catch((error) => {
      datadogLogs.logger.error(`error: fetchApplicationById - ${error}`);
      console.error("fetchApplicationById", error);
      dispatch({ type: ActionType.SET_ERROR_GET_APPLICATION, payload: error });
    })
    .finally(() => dispatch({ type: ActionType.SET_LOADING, payload: false }));
}

const fetchApplicationsByRoundId = async (
  dispatch: Dispatch,
  roundId: string,
  walletProvider: Web3Provider
) => {
  datadogLogs.logger.info(`fetchApplicationsByRoundId: roundId - ${roundId}`);

  dispatch({ type: ActionType.SET_LOADING, payload: true });
  getApplicationsByRoundId(roundId, walletProvider)
    .then((applications) =>
      dispatch({
        type: ActionType.SET_ROUND_APPLICATIONS,
        payload: applications,
      })
    )
    .catch((error) => {
      datadogLogs.logger.error(
        `error: fetchApplicationsByRoundId - ${error} roundId - ${roundId}`
      );
      console.error(`fetchApplicationByRoundId roundId - ${roundId}`, error);
      dispatch({
        type: ActionType.SET_ERROR_GET_ROUND_APPLICATIONS,
        payload: error,
      });
    })
    .finally(() => dispatch({ type: ActionType.SET_LOADING, payload: false }));
};

export const useApplicationById = (
  id: string
): {
  application: GrantApplication | undefined;
  isLoading: boolean;
  getApplicationByIdError?: Error;
} => {
  const context = useContext(ApplicationContext);

  if (context === undefined) {
    throw new Error(
      "useApplicationById must be used within a ApplicationProvider"
    );
  }

  const { provider: walletProvider } = useWallet();

  useEffect(() => {
    if (id) {
      // NB: we always refetch application by id to populate project owners for application page
      fetchApplicationById(context.dispatch, id, walletProvider);
    }
  }, [id, walletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    application: context.state.applications.find(
      (application) => application.id === id
    ),
    isLoading: context.state.isLoading,
    getApplicationByIdError: context.state.getApplicationByIdError,
  };
};

export const useApplicationByRoundId = (
  roundId: string
): {
  applications: GrantApplication[] | undefined;
  isLoading: boolean;
  getApplicationByRoundIdError?: Error;
} => {
  const context = useContext(ApplicationContext);

  if (context === undefined) {
    throw new Error(
      "useApplicationByRoundId must be used within a ApplicationProvider"
    );
  }

  const { provider: walletProvider } = useWallet();

  useEffect(() => {
    fetchApplicationsByRoundId(
      context.dispatch,
      roundId?.toLowerCase(),
      walletProvider
    );
  }, [roundId, walletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    applications: context.state.applications,
    isLoading: context.state.isLoading,
    getApplicationByRoundIdError: context.state.getApplicationByRoundIdError,
  };
};
