import { Dispatch } from "redux";
import { Alert, AlertTypes, newAlert } from "../types/alert";

export const UI_ALERT_ADDED = "UI_ALERT_ADDED";
export interface UIAlertAddedAction {
  type: typeof UI_ALERT_ADDED;
  payload: Alert;
}

export const UI_ALERT_REMOVED = "UI_ALERT_REMOVED";
export interface UIAlertRemovedAction {
  type: typeof UI_ALERT_REMOVED;
  payload: number;
}

export type UIActions = UIAlertAddedAction | UIAlertRemovedAction;

export const addAlert = (
  type: AlertTypes,
  title: string | undefined,
  body: string | undefined
): UIActions => ({
  type: UI_ALERT_ADDED,
  payload: newAlert(type, title!, body!),
});

export const removeAlert = (id: number): UIActions => ({
  type: UI_ALERT_REMOVED,
  payload: id,
});

export const removeAlertDelayed =
  (id: number, delay: number) => (dispatch: Dispatch) => {
    setTimeout(() => {
      dispatch(removeAlert(id));
    }, delay);
  };
