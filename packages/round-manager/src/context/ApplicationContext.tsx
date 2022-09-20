import React, { createContext, useContext, useEffect, useReducer } from "react";
import { GrantApplication } from "../features/api/types";
import { useWallet } from "../features/common/Auth";
import { getApplicationById, getApplicationsByRoundId } from "../features/api/application";
import { Web3Provider } from "@ethersproject/providers";

enum ActionType {
  SET_APPLICATIONS = "SET_APPLICATIONS",
  SET_ROUND_APPLICATIONS = "SET_ROUND_APPLICATIONS",
  SET_LOADING = "SET_LOADING",
  SET_ERROR_GET_APPLICATION = "SET_ERROR_GET_APPLICATION",
  SET_ERROR_GET_ROUND_APPLICATIONS = "SET_ERROR_GET_ROUND_APPLICATIONS",
}

interface Action {
  type: ActionType;
  payload?: any;
}

type Dispatch = (action: Action) => void;

export interface ApplicationState {
  application?: GrantApplication;
  applications?: GrantApplication[];
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
    case ActionType.SET_APPLICATIONS:
      return {
        ...state,
        application: action.payload,
      };
    case ActionType.SET_ROUND_APPLICATIONS:
      return {
        ...state,
        applications: action.payload,
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
        getApplicationByRoundIdError: action.payload,
      };
    default:
      return state;
  }
};

export const initialApplicationState: ApplicationState = {
  application: undefined,
  applications: undefined,
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
  dispatch({ type: ActionType.SET_LOADING, payload: true });
  getApplicationById(id, walletProvider)
    .then((application) => {
      dispatch({ type: ActionType.SET_APPLICATIONS, payload: application });
    })
    .catch((error) =>
      dispatch({ type: ActionType.SET_ERROR_GET_APPLICATION, payload: error })
    )
    .finally(() => dispatch({ type: ActionType.SET_LOADING, payload: false }));
}

const fetchApplicationsByRoundId = async (
  dispatch: Dispatch,
  roundId: string,
  walletProvider: Web3Provider,
) => {
  dispatch({ type: ActionType.SET_LOADING, payload: true });
  getApplicationsByRoundId(roundId, walletProvider)
    .then((applications) =>
      dispatch({ type: ActionType.SET_ROUND_APPLICATIONS, payload: applications })
    )
    .catch((error) =>
      dispatch({ type: ActionType.SET_ERROR_GET_ROUND_APPLICATIONS, payload: error })
    )
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
    fetchApplicationById(context.dispatch, id, walletProvider);
  }, [id, walletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    application: context.state.application,
    isLoading: context.state.isLoading,
    getApplicationByIdError: context.state.getApplicationByIdError,
  };
};

export const useApplicationByRoundId = (
  roundId: string,
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
    fetchApplicationsByRoundId(context.dispatch, roundId, walletProvider)
  }, [roundId, walletProvider]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    applications: context.state.applications,
    isLoading: context.state.isLoading,
    getApplicationByRoundIdError: context.state.getApplicationByRoundIdError,
  };
};