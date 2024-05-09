import { Address, PublicClient } from "viem";
import { AdapterResponse, AdapterError } from "../../adapter";

export function canAllocate(
  _client: PublicClient,
  _poolId: string,
  _allocatorAddress: Address | undefined
): Promise<AdapterResponse<boolean>> {
  // This is a test to simulate a delay in the response.
  return new Promise((resolve) => {
    // A normal Donation Strategy would return true here;
    // anyone can vote.
    // return resolve({
    //   type: "success",
    //   value: true,
    // });

    // We simulate here something like a token-gated pool
    setTimeout(() => {
      // Simulate an async check.
      // A real example can be:
      // - Check if the user has a specific token in their wallet.
      // - return success if they have the token.
      // - return error if they don't have the token.
      return resolve({
        type: "error",

        error: new AdapterError("you don't have a badge to vote."),
      });
    }, 2000);
  });
}

export function requiresAmount(
  _client: PublicClient,
  _poolId: string
): Promise<boolean> {
  return Promise.resolve(true);
}
