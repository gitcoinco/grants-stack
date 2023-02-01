import { Alert } from "../types/alert";
import { UI_ALERT_ADDED, UI_ALERT_REMOVED, UIActions } from "../actions/ui";

export type UIState = {
  alerts: Alert[];
};

const initialState: UIState = {
  alerts: [],
};

export const uiReducer = (
  state: UIState = initialState,
  action: UIActions
): UIState => {
  switch (action.type) {
    case UI_ALERT_ADDED: {
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    }

    case UI_ALERT_REMOVED: {
      const index = state.alerts.map((a) => a.id).indexOf(action.payload);
      if (index < 0) {
        return state;
      }

      return {
        ...state,
        alerts: [
          ...state.alerts.slice(0, index),
          ...state.alerts.slice(index + 1),
        ],
      };
    }

    default:
      return state;
  }
};
