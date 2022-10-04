export type AlertTypes = "success" | "error";

export type Alert = {
  id: number;
  type: AlertTypes;
  message: string;
};

let nextAlertID = 0;

export const newAlert = (type: AlertTypes, message: string) => ({
  // eslint-disable-next-line
  id: nextAlertID++,
  type,
  message,
});
