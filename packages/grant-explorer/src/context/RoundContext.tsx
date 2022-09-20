import { createContext, useContext, useEffect, useReducer } from "react";
import { getRoundById } from "../features/api/round";
import { Round } from "../features/api/types";

export interface RoundState {
  rounds: Round[];
  isLoading: boolean;
  listRoundsError?: Error;
  getRoundByIdError?: Error;
}

enum ActionType {
  SET_LOADING = "SET_LOADING",
  FINISH_LOADING = "FINISH_LOADING",
  SET_ROUNDS = "SET_ROUNDS",
  SET_ERROR_LIST_ROUNDS = "SET_ERROR_LIST_ROUNDS",
  ADD_ROUND = "ADD_ROUND",
  SET_ERROR_GET_ROUND = "SET_ERROR_GET_ROUND",
}

interface Action {
  type: ActionType;
  payload?: any;
}

type Dispatch = (action: Action) => void;

export const initialRoundState: RoundState = {
  rounds: [],
  isLoading: false,
};

export const RoundContext = createContext<
  { state: RoundState; dispatch: Dispatch } | undefined
>(undefined);

const roundReducer = (state: RoundState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionType.FINISH_LOADING:
      return { ...state, isLoading: false };
    case ActionType.SET_ROUNDS:
      return {
        ...state,
        rounds: action.payload ?? [],
        listRoundsError: undefined,
      };
    case ActionType.SET_ERROR_LIST_ROUNDS:
      return { ...state, rounds: [], listRoundsError: action.payload };
    case ActionType.ADD_ROUND:
      return {
        ...state,
        rounds: state.rounds.concat(action.payload),
        getRoundByIdError: undefined,
      };
    case ActionType.SET_ERROR_GET_ROUND:
      return { ...state, getRoundByIdError: action.payload };
    default:
      return state;
  }
};

export const RoundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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


function fetchRoundsById(dispatch: Dispatch, chainId: string, roundId: string) {
  dispatch({ type: ActionType.SET_LOADING, payload: true });

  getRoundById(roundId, chainId)
    .then((round) =>
      dispatch({ type: ActionType.ADD_ROUND, payload: round })
    )
    .catch((error) =>
      dispatch({ type: ActionType.SET_ERROR_GET_ROUND, payload: error })
    )
    .finally(() =>
      dispatch({ type: ActionType.FINISH_LOADING })
    );
}

export const useRoundById = (
  chainId: string,
  roundId: string
): {
  round?: Round;
  isLoading: boolean;
  getRoundByIdError?: Error;
} => {  
  const context = useContext(RoundContext);
  if (context === undefined) {
    throw new Error("useRoundById must be used within a RoundProvider");
  }

  useEffect(() => {
    if (roundId) {
      const existingRound = context.state.rounds.find(
        (round) => round.id === roundId
      );

      if (!existingRound) {
        fetchRoundsById(context.dispatch, chainId, roundId);
      }
    }
  }, [chainId, roundId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    round: context.state.rounds.find((round) => round.id === roundId),
    isLoading: context.state.isLoading,
    getRoundByIdError: context.state.getRoundByIdError,
  };
}