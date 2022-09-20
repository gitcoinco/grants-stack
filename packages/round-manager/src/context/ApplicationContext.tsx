import React, { createContext, useContext, useEffect, useReducer } from "react";
import { GrantApplication } from "../features/api/types";
import { useWallet } from "../features/common/Auth";
import { getApplicationById } from "../features/api/application";

enum ActionType {
  SET_APPLICATIONS = "SET_APPLICATIONS",
  SET_LOADING = "SET_LOADING",
  SET_ERROR_GET_APPLICATION = "SET_ERROR_GET_APPLICATION",
}

interface Action {
  type: ActionType;
  payload?: any;
}

type Dispatch = (action: Action) => void;

export interface ApplicationState {
  application?: GrantApplication;
  isLoading: boolean;
  getApplicationByIdError?: Error;
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
  }

  return state;
};

export const initialApplicationState: ApplicationState = {
  application: undefined,
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
  walletProvider: any
) {
  dispatch({ type: ActionType.SET_LOADING, payload: true });
  getApplicationById(id!, walletProvider)
    .then((application) => {
      dispatch({ type: ActionType.SET_APPLICATIONS, payload: application });
    })
    .catch((error) =>
      dispatch({ type: ActionType.SET_ERROR_GET_APPLICATION, payload: error })
    )
    .finally(() => dispatch({ type: ActionType.SET_LOADING, payload: false }));
}

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
