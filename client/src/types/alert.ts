export type AlertTypes = "success" | "error" | "info" | "warning";

export type Alert = {
  id: number;
  type: AlertTypes;
  title: JSX.Element | string;
  body: JSX.Element | string;
};

let nextAlertID = 0;

export const newAlert = (
  type: AlertTypes,
  title: JSX.Element | string,
  body: JSX.Element | string
) => ({
  // eslint-disable-next-line
  id: nextAlertID++,
  type,
  title,
  body,
});
