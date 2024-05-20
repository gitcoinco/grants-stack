import { AlloError } from "./allo";

export interface WaitUntilIndexerSynced {
  (args: {
    chainId: number;
    blockNumber: bigint;
    pollIntervalInMs?: number;
  }): Promise<bigint>;
}

function wait(ms = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Waits until the indexer is synchronized to a specified block number.
 * @param args - Object with parameters:
 *  chainId - The chain ID.
 *  blockNumber - The target block number.
 *  pollIntervalInMs - Polling interval in milliseconds (default: 1000).
 * @returns A Promise resolving to the synchronized block number.
 */
export const createWaitForIndexerSyncTo = (
  endpoint: string
): WaitUntilIndexerSynced => {
  if (!endpoint) {
    throw new Error("Missing endpoint.");
  }
  const waitForIndexerSyncTo: WaitUntilIndexerSynced = async (args) => {
    try {
      const { chainId, blockNumber, pollIntervalInMs = 1000 } = args;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query getBlockNumberQuery($chainId: Int!) {
              subscriptions(
                filter: { chainId: { equalTo: $chainId }, toBlock: { equalTo: "latest" } }
              ) {
                chainId
                indexedToBlock
              }
            }
          `,
          variables: {
            chainId,
          },
        }),
      });

      if (response.status === 200) {
        const {
          data,
        }: {
          data: {
            subscriptions: { chainId: number; indexedToBlock: string }[];
          };
        } = await response.json();

        const subscriptions = data?.subscriptions || [];

        if (subscriptions.length > 0) {
          const currentBlockNumber = BigInt(
            subscriptions.reduce(
              (minBlock, sub) =>
                BigInt(sub.indexedToBlock) < BigInt(minBlock)
                  ? sub.indexedToBlock
                  : minBlock,
              subscriptions[0].indexedToBlock
            )
          );

          if (currentBlockNumber >= BigInt(blockNumber)) {
            return currentBlockNumber;
          }
        }
      }

      await wait(pollIntervalInMs);
      // Use the named function for the recursive call
      return await waitForIndexerSyncTo({
        chainId,
        blockNumber,
        pollIntervalInMs,
      });
    } catch (error) {
      console.error(error);
      throw new AlloError("Failed to determine indexing status.");
    }
  };

  return waitForIndexerSyncTo;
};
