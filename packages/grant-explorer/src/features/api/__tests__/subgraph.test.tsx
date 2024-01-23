import {
  getCurrentSubgraphBlockNumber,
  waitForSubgraphSyncTo,
} from "../subgraph";
import { __deprecated_graphql_fetch } from "../utils";
import { Mock } from "vitest";

vi.mock("../utils", () => ({
  ...vi.importActual("../utils"),
  __deprecated_graphql_fetch: vi.fn(),
}));

vi.mock("common", () => ({
  ...vi.importActual("common"),
  graphql_fetch: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getCurrentSubgraphBlockNumber", () => {
  it("retrieves the current block number of the subgraph index", async () => {
    const chainId = 1;
    const expectedCurrentBlockNumber = 999;
    (__deprecated_graphql_fetch as Mock).mockResolvedValue({
      data: {
        _meta: {
          block: {
            number: expectedCurrentBlockNumber,
            hash: "somehash",
          },
        },
      },
    });

    const actualCurrentBlockNumber =
      await getCurrentSubgraphBlockNumber(chainId);

    expect(actualCurrentBlockNumber).toEqual(expectedCurrentBlockNumber);
  });
});

describe("Wait for subgraph to sync", () => {
  const chainId = 123;
  const pollIntervalInMs = 0; // decrease polling interval for shorter test runs

  it("resolves when the current block number is greater than to the desired block number", async () => {
    const desiredBlockNumber = 5000;
    (__deprecated_graphql_fetch as Mock).mockResolvedValue({
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

    expect(__deprecated_graphql_fetch).toBeCalledTimes(1);
  });

  it("keeps polling until the current block number is greater than or equal to the desired block number", async () => {
    const desiredBlockNumber = 5000;
    (__deprecated_graphql_fetch as Mock)
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

    expect(__deprecated_graphql_fetch).toBeCalledTimes(3);
  });
});
