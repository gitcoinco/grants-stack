import { Address, PublicClient } from "viem";

export class AdapterError extends Error {
  public readonly reason: string;
  public readonly innerError?: Error;

  constructor(reason: string, innerError?: Error) {
    super(reason);
    this.reason = reason;
    this.innerError = innerError;
  }
}

export class AdapterResponseError extends AdapterError {
  constructor(reason: string, error: AdapterError) {
    super(reason, error);
  }
}

export class UnknownAdapterError extends AdapterError {
  constructor(strategyName: string) {
    super(`Adapter not found for strategy: ${strategyName}`);
  }
}

export type AdapterResponse<T> =
  | { type: "success"; value: T }
  | { type: "error"; error: AdapterError };

export interface AllocationAdapter {
  // Returns true if the allocator can allocate to the pool.
  // If the pool has token gated allocations,
  // this function should check if the allocator has the required tokens.
  // allocatorAddress is undefined if the user's wallet is not connected.
  // In some cases the adapter doesn't need the address to determine if the allocator can allocate.
  canAllocate: (
    client: PublicClient,
    poolId: string,
    allocatorAddress: Address | undefined
  ) => Promise<AdapterResponse<boolean>>;

  // Returns true if the pool requires an amount
  // to be specified by the allocator in the UI.
  requiresAmount: (client: PublicClient, poolId: string) => Promise<boolean>;
}

export interface Adapter {
  allocation?: AllocationAdapter;
}
