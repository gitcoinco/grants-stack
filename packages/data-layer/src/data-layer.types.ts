import { CustomError } from "ts-custom-error";

export type AlloVersion = "allo-v1" | "allo-v2";

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export class NotImplementedError extends CustomError {
  public constructor(message?: string) {
    super(message ?? "Not implemented");
  }
}
