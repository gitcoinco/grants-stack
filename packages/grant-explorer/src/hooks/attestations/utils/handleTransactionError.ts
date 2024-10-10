import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from "viem";

/**
 * Custom Error class for handling transaction-related errors.
 */
export class TransactionError extends Error {
  reason?: string;
  data?: { message: string };

  constructor(reason: string, data?: { message: string }) {
    super(reason);
    this.reason = reason;
    this.data = data;
  }
}

/**
 * Function to handle and rethrow transaction errors with user-friendly messages.
 */
export function handleTransactionError(error: Error) {
  if (error instanceof BaseError) {
    if (error instanceof ContractFunctionRevertedError) {
      const errorName = error.data?.errorName ?? "Unknown Error";
      throw new TransactionError(errorName, { message: errorName });
    }

    if (error instanceof InsufficientFundsError) {
      throw new TransactionError("Insufficient Funds", {
        message: "Insufficient funds to complete the transaction.",
      });
    }

    if (error instanceof UserRejectedRequestError) {
      throw new TransactionError("User Rejected Request", {
        message: "You have rejected the request.",
      });
    }
  }

  // Handle unknown errors
  throw new TransactionError("Transaction Failed", {
    message: "An unknown error occurred.",
  });
}
