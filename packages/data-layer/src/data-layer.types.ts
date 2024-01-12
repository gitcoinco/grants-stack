import { CustomError } from "ts-custom-error";

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
