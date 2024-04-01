import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Round } from "../features/api/types";
import { DataLayer, useDataLayer } from "data-layer";

export interface RoundState {
  rounds: Round[];
  isLoading: boolean;
  listRoundsError?: Error;
  getRoundByIdError?: Error;
  currentRoundId?: string;
}

export class RoundNotFoundError extends Error {
  constructor(chainId: number, roundId: string) {
    super(`Round not found: chainId=${chainId}, roundId=${roundId}`);
  }
}

enum ActionType {
  SET_LOADING = "SET_LOADING",
  FINISH_LOADING = "FINISH_LOADING",
  SET_ROUNDS = "SET_ROUNDS",
  SET_ERROR_LIST_ROUNDS = "SET_ERROR_LIST_ROUNDS",
  ADD_ROUND = "ADD_ROUND",
  SET_ERROR_GET_ROUND = "SET_ERROR_GET_ROUND",
  SET_ROUND_ID = "SET_ROUND_ID",
}

interface Action {
  type: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

type Dispatch = (action: Action) => void;

export const initialRoundState: RoundState = {
  rounds: [],
  isLoading: true,
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
      // log error to console to be sure we can debug it
      console.error(action.payload);
      return { ...state, getRoundByIdError: action.payload };
    case ActionType.SET_ROUND_ID:
      return { ...state, currentRoundId: action.payload };
    default:
      return state;
  }
};

export const RoundProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(roundReducer, initialRoundState);

  const providerProps = { state, dispatch };

  return (
    <RoundContext.Provider value={providerProps}>
      {children}
    </RoundContext.Provider>
  );
};

function fetchRoundsById(
  dispatch: Dispatch,
  dataLayer: DataLayer,
  chainId: number,
  roundId: string
) {
  dispatch({ type: ActionType.SET_LOADING, payload: true });

  dataLayer
    .getRoundForExplorer({
      roundId,
      chainId,
    })
    .then((result) => {
      if (result === null) {
        dispatch({
          type: ActionType.SET_ERROR_GET_ROUND,
          payload: new RoundNotFoundError(chainId, roundId),
        });
      } else {
        const { round } = result;
        dispatch({ type: ActionType.ADD_ROUND, payload: round });
      }
    })
    .catch((error) =>
      dispatch({ type: ActionType.SET_ERROR_GET_ROUND, payload: error })
    )
    .finally(() => dispatch({ type: ActionType.FINISH_LOADING }));
}

export const useRoundById = (
  chainId: number,
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
  const dataLayer = useDataLayer();

  useEffect(() => {
    context.dispatch({ type: ActionType.SET_ROUND_ID, payload: roundId });
    if (roundId) {
      const existingRound = context.state.rounds.find(
        (round) => round.id === roundId && round.chainId === chainId
      );

      if (!existingRound?.token) {
        fetchRoundsById(context.dispatch, dataLayer, chainId, roundId);
      }
    }
  }, [chainId, roundId]); // eslint-disable-line react-hooks/exhaustive-deps

  const round = context.state.rounds.find(
    (round) => round.id === roundId && round.chainId === chainId
  );

  return {
    round: round,
    isLoading: context.state.isLoading,
    getRoundByIdError: context.state.getRoundByIdError,
  };
};
