import { graphql_fetch } from "..";

export interface WaitUntilIndexerSynced {
  (args: {
    chainId: number;
    blockNumber: bigint;
    pollIntervalInMs?: number;
  }): Promise<bigint>;
}

// todo: add waitForIndexerSynced
// todo: if we move this call to the data layer we need to create an instance of it here.
// export const waitForIndexerSyncedTo: WaitUntilIndexerSynced = async (args) => {
//   const { chainId, blockNumber, pollIntervalInMs = 1000 } = args;
//   let currentBlockNumber = await getIndexedToBlockNumber(chainId);

//   console.log("currentBlockNumber", currentBlockNumber);

//   while (currentBlockNumber < blockNumber) {
//     await wait(pollIntervalInMs);
//     currentBlockNumber = await getIndexedToBlockNumber(chainId);
//   }
//   return currentBlockNumber;
// };

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

// export async function getIndexedToBlockNumber(
//   chainId: number
// ): Promise<bigint> {
//   const res = dataLayer.getIndexerBlockNumberTo(chainId);

//   console.log("res from query", res);
//   return BigInt((await res).toString());
// }
