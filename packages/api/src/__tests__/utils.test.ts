import { enableFetchMocks, FetchMock } from "jest-fetch-mock";

enableFetchMocks();

import { ChainId } from "../types";
import {
  fetchFromIPFS,
  fetchFromGraphQL,
  getGraphQLEndpoint,Ï
  getChainVerbose,
  getPriceForToken,
} from "../utils";

const fetchMock = fetch as FetchMock;

describe("getGraphQLEndpoint", () => {
  it("returns the right graphQL endpoint based on chainID", () => {
    expect(getGraphQLEndpoint(ChainId.OPTIMISM_MAINNET)).toEqual(
      "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-optimism-mainnet"
    );

    expect(getGraphQLEndpoint(ChainId.FANTOM_MAINNET)).toEqual(
      "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-mainnet"
    );

    expect(getGraphQLEndpoint(ChainId.FANTOM_TESTNET)).toEqual(
      "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-fantom-testnet"
    );

    expect(getGraphQLEndpoint(ChainId.GOERLI)).toEqual(
      "https://api.thegraph.com/subgraphs/name/gitcoinco/grants-round-goerli-testnet"
    );
  });

  it("returns the default graphQL endpoint for invalid chainID", () => {
    expect(getGraphQLEndpoint("999" as ChainId)).toEqual(
      "https://api.thegraph.com/subgraphs/name/thelostone-mc/round-labs"
    );
  });
});

describe("getChainVerbose", () => {
  it("returns the right chain name chainID", () => {
    expect(getChainVerbose(ChainId.OPTIMISM_MAINNET)).toEqual(
      "OPTIMISM_MAINNET"
    );
    expect(getChainVerbose(ChainId.FANTOM_MAINNET)).toEqual("FANTOM_MAINNET");
    expect(getChainVerbose(ChainId.FANTOM_TESTNET)).toEqual("FANTOM_TESTNET");
    expect(getChainVerbose(ChainId.GOERLI)).toEqual("GOERLI");
  });

  it("returns the default chain name for invalid chainID", () => {
    expect(getChainVerbose("999" as ChainId)).toEqual("LOCAL_ROUND_LAB");
  });
});

describe("fetchFromIPFS", () => {
  const REACT_APP_PINATA_GATEWAY = "gitcoin.mypinata.cloud";

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should return data from IPFS", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ name: "My First Metadata" }));

    const cid = "bafkreih475g3yk67xjenvlatgumnbtqay7edgyrxevoqzihjltjm3f6cf4";

    const res = await fetchFromIPFS(cid);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://${REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`
    );
    expect(res).toEqual({ name: "My First Metadata" });
  });

  it("should throw on invalid CID", async () => {
    const cid = "invalidcid";

    fetchMock.mockResponseOnce("", {
      status: 404,
    });

    await expect(fetchFromIPFS(cid)).rejects.toHaveProperty("status", 404);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://${REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`
    );
  });
});

describe("fetchFromGraphQL", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should return data from a graphql endpoint", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        data: {
          programs: [
            { id: "0x123456789544fe81379e2951623f008d200e1d18" },
            { id: "0x123456789567fe81379e2951623f008d200e1d20" },
          ],
        },
      })
    );

    const query = `
      programs {
        id
      }
    `;

    const res = await fetchFromGraphQL(ChainId.GOERLI, query);

    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {},
      }),
    };

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`,
      params
    );
    expect(res.data.programs[0]).toEqual({
      id: "0x123456789544fe81379e2951623f008d200e1d18",
    });
  });

  it("should reject on non-200 status code", async () => {
    fetchMock.mockResponseOnce("", {
      status: 400,
    });

    const query = `
      programs {
        id
      }
    `;

    await expect(
      fetchFromGraphQL(ChainId.GOERLI, query)
    ).rejects.toHaveProperty("status", 400);

    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {},
      }),
    };

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`,
      params
    );
  });

  it("should fetch data from the correct graphql endpoint for optimism network", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        data: {},
      })
    );

    await fetchFromGraphQL(ChainId.OPTIMISM_MAINNET, `programs { id }`);

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`,
      expect.anything()
    );
  });
});

describe("fetch prices for token", function () {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should fetch prices for a certain token on a chain", async function () {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        market_data: {
          current_price: "123.0",
        },
      })
    );

    await getPriceForToken(
      "0x6b175474e89094c44da98b954eedeac495271d0f",
      "ethereum"
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.coingecko.com/api/v3/coins/ethereum/contract/0x6b175474e89094c44da98b954eedeac495271d0f`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
  });
});

describe("fetchRoundMetadata", () => {
  // TODO:
});

describe("handleResponse", () => {
  // TODO:
});
