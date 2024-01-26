import { graphql_fetch } from "../graphql_fetch";

export interface WaitUntilIndexerSynced {
  (args: {
    chainId: number;
    blockNumber: bigint;
    pollIntervalInMs?: number;
  }): Promise<bigint>;
}

export const waitForSubgraphSyncTo: WaitUntilIndexerSynced = async (args) => {
  const { chainId, blockNumber, pollIntervalInMs = 1000 } = args;
  let currentBlockNumber = await getCurrentSubgraphBlockNumber(chainId);

  while (currentBlockNumber < blockNumber) {
    await wait(pollIntervalInMs);
    currentBlockNumber = await getCurrentSubgraphBlockNumber(chainId);
  }
  return currentBlockNumber;
};

function wait(ms = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getCurrentSubgraphBlockNumber(
  chainId: number
): Promise<bigint> {
  const res = await graphql_fetch(
    `
      {
        _meta {
          block {
            number,
            hash
          }
        }
      }
    `,
    chainId
  );
  return BigInt(res.data._meta.block.number);
}
