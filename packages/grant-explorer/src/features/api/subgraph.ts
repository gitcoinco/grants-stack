import { ChainId } from "common/src/chains";
import { graphql_fetch } from "./utils";

export async function getCurrentSubgraphBlockNumber(
  chainId: ChainId
): Promise<number> {
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
  return res.data._meta.block.number;
}

export async function waitForSubgraphSyncTo(
  chainId: number,
  blockNumber: number,
  pollIntervalInMs = 100
): Promise<number> {
  let currentBlockNumber = await getCurrentSubgraphBlockNumber(chainId);
  while (currentBlockNumber < blockNumber) {
    await wait(pollIntervalInMs);
    currentBlockNumber = await getCurrentSubgraphBlockNumber(chainId);
  }
  return currentBlockNumber;
}

const wait = (ms = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
