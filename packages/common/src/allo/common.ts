export type Result<T> =
  | { type: "success"; value: T }
  | { type: "error"; error: Error };

export function success<T>(value: T): Result<T> {
  return { type: "success", value };
}

export function error<T>(error: Error): Result<T> {
  return { type: "error", error };
}

export const dateToEthereumTimestamp = (date: Date): bigint =>
  BigInt(Math.floor(date.getTime() / 1000));

export const UINT64_MAX = 18446744073709551615n;

export { NATIVE } from "@allo-team/allo-v2-sdk";
