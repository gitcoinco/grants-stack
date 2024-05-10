export type AdapterNotFoundError = {
  type: "ADAPTER_NOT_FOUND";
  strategyName: string;
  error: Error;
};

export type AdapterAllocationUnauthorizedError = {
  type: "ADAPTER_ALLOCATION_UNAUTHORIZED";
  error: Error;
};

export type AdapterUnknownError = {
  type: "ADAPTER_UNKNOWN_ERROR";
  error: Error;
};

export type AdapterErrorWrapper =
  | AdapterNotFoundError
  | AdapterAllocationUnauthorizedError
  | AdapterUnknownError;
