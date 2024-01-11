import { AlloError } from ".";

export type Result<T> =
  | { type: "success"; value: T }
  | { type: "error"; error: Error };

export function success<T>(value: T): Result<T> {
  return { type: "success", value };
}

export function error<T>(error: Error): Result<T> {
  return { type: "error", error };
}

export async function uploadToIPFS(
  _metadata: unknown
): Promise<Result<string>> {
  try {
    const metadataCid = "..";

    return success(metadataCid);
  } catch (err) {
    return error(new AlloError("Failed to upload to IPFS", err));
  }
}
