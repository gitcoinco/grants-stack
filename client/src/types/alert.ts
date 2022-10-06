export type AlertTypes = "success" | "error" | "info" | "warning";

export type Alert = {
  id: number;
  type: AlertTypes;
  title: string | undefined;
  body: string | undefined;
};

let nextAlertID = 0;

export const newAlert = (type: AlertTypes, title: string, body: string) => ({
  // eslint-disable-next-line
  id: nextAlertID++,
  type,
  title,
  body,
});
