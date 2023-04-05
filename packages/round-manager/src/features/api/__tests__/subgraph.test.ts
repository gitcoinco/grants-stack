import { graphql_fetch } from "common";
import {
  getCurrentSubgraphBlockNumber,
  waitForSubgraphSyncTo,
} from "../subgraph";

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  graphql_fetch: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getCurrentSubgraphBlockNumber", () => {
  it("retrieves the current block number of the subgraph index", async () => {
    const chainId = 123;
    const expectedCurrentBlockNumber = 999;
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        _meta: {
          block: {
            number: expectedCurrentBlockNumber,
            hash: "somehash",
          },
        },
      },
    });

    const actualCurrentBlockNumber = await getCurrentSubgraphBlockNumber(
      chainId
    );

    expect(actualCurrentBlockNumber).toEqual(expectedCurrentBlockNumber);
  });
});

describe("Wait for subgraph to sync", () => {
  const chainId = 123;
  const pollIntervalInMs = 0; // decrease polling interval for shorter test runs

  it("resolves when the current block number is greater than to the desired block number", async () => {
    const desiredBlockNumber = 5000;
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        _meta: {
          block: {
            number: desiredBlockNumber + 1000,
            hash: "somehash",
          },
        },
      },
    });

    await waitForSubgraphSyncTo(chainId, desiredBlockNumber, pollIntervalInMs);

    expect(graphql_fetch).toBeCalledTimes(1);
  });

  it("keeps polling until the current block number is greater than or equal to the desired block number", async () => {
    const desiredBlockNumber = 5000;
    (graphql_fetch as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          _meta: {
            block: {
              number: desiredBlockNumber - 1000,
              hash: "somehash",
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          _meta: {
            block: {
              number: desiredBlockNumber - 500,
              hash: "somehash",
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          _meta: {
            block: {
              number: desiredBlockNumber,
              hash: "somehash",
            },
          },
        },
      });

    await waitForSubgraphSyncTo(chainId, desiredBlockNumber, pollIntervalInMs);

    expect(graphql_fetch).toBeCalledTimes(3);
  });
});
