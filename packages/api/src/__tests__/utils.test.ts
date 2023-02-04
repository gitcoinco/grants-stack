import { enableFetchMocks, FetchMock } from "jest-fetch-mock";

enableFetchMocks();
import * as utils from "../utils";
import { ChainId } from "../types";
import {
  denominateAs,
  fetchFromGraphQL,
  fetchFromIPFS,
  fetchRoundMetadata,
  getChainName,
  getChainVerbose,
  getGraphQLEndpoint,
  getStartAndEndTokenPrices,
  getStrategyName,
  getUSDCAddress,
  groupBy,
  isTestnet,
} from "../utils";
import { mockRoundMetadata } from "../test-utils";
import { faker } from "@faker-js/faker";

const fetchMock = fetch as FetchMock;

describe("getGraphQLEndpoint", () => {
  it("returns the right graphQL endpoint based on chainID", () => {
    expect(getGraphQLEndpoint(ChainId.OPTIMISM_MAINNET)).toEqual(
      `${process.env.SUBGRAPH_OPTIMISM_MAINNET_API}`
    );

    expect(getGraphQLEndpoint(ChainId.FANTOM_MAINNET)).toEqual(
      `${process.env.SUBGRAPH_FANTOM_MAINNET_API}`
    );

    expect(getGraphQLEndpoint(ChainId.FANTOM_TESTNET)).toEqual(
      `${process.env.SUBGRAPH_FANTOM_TESTNET_API}`
    );

    expect(getGraphQLEndpoint(ChainId.GOERLI)).toEqual(
      `${process.env.SUBGRAPH_GOERLI_API}`
    );
  });

  it("returns the default graphQL endpoint for invalid chainID", () => {
    expect(getGraphQLEndpoint("999" as ChainId)).toEqual(
      `${process.env.SUBGRAPH_DUMMY_API}`
    );
  });
});

describe("getUSDCAddress", () => {
  it("returns the right USDC address based on the chainID", () => {
    expect(getUSDCAddress(ChainId.OPTIMISM_MAINNET)).toEqual(
      "0x7f5c764cbc14f9669b88837ca1490cca17c31607"
    );
    expect(getUSDCAddress(ChainId.FANTOM_MAINNET)).toEqual(
      "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"
    );
    expect(getUSDCAddress(ChainId.MAINNET)).toEqual(
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    );
  });

  it("returns default 0x0 address for chainId which is not supported", () => {
    expect(getUSDCAddress(ChainId.LOCAL_ROUND_LAB)).toEqual(
      "0x0000000000000000000000000000000000000000"
    );
  });
});

describe("getChainVerbose", () => {
  it("returns the right chain name chainID", () => {
    expect(getChainVerbose(ChainId.OPTIMISM_MAINNET)).toEqual(
      "OPTIMISM_MAINNET"
    );
    expect(getChainVerbose(ChainId.MAINNET)).toEqual("MAINNET");
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
      `${process.env.SUBGRAPH_GOERLI_API}`,
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
      `${process.env.SUBGRAPH_GOERLI_API}`,
      params
    );
  });

  it("should fetch data from the correct graphql endpoint for optimism network", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        data: {},
      })
    );

    await fetchFromGraphQL(ChainId.OPTIMISM_MAINNET, "");

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.SUBGRAPH_OPTIMISM_MAINNET_API}`,
      {
        body: '{"query":"","variables":{}}',
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }
    );
  });
});

describe("fetchRoundMetadata", () => {
  it("returns valid round metadata in expected format", async () => {
    const roundMetadata = JSON.parse(JSON.stringify(mockRoundMetadata));
    const chainId = ChainId.MAINNET;
    const roundId = faker.finance.ethereumAddress.toString();

    jest.spyOn(utils, "fetchFromGraphQL").mockResolvedValueOnce({
      data: {
        rounds: [
          {
            projectsMetaPtr: {
              pointer: "QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ",
              protocol: 1,
            },
            votingStrategy: roundMetadata.votingStrategy,
            roundStartTime: roundMetadata.roundStartTime,
            roundEndTime: roundMetadata.roundEndTime,
            token: roundMetadata.token,
            roundMetaPtr: {
              protocol: "1",
              pointer: faker.finance.ethereumAddress.toString(),
            },
          },
        ],
      },
    });

    jest.spyOn(utils, "fetchFromIPFS").mockResolvedValueOnce({
      matchingFunds: {
        matchingFundsAvailable: roundMetadata.totalPot,
      },
    });

    const metadata = await fetchRoundMetadata(chainId, roundId);

    expect(metadata).toEqual(roundMetadata);
  });
});

describe("getChainName", () => {
  it("returns the chain name based on the chainId", () => {
    expect(getChainName(ChainId.MAINNET)).toEqual({
      chainName: "ethereum",
      error: false,
    });
    expect(getChainName(ChainId.OPTIMISM_MAINNET)).toEqual({
      chainName: "optimistic-ethereum",
      error: false,
    });
    expect(getChainName(ChainId.FANTOM_MAINNET)).toEqual({
      chainName: "fantom",
      error: false,
    });
  });

  it("returns error when unsupported chainId is passed", () => {
    expect(getChainName(ChainId.LOCAL_ROUND_LAB)).toEqual({
      chainName: undefined,
      error: true,
    });
  });
});

describe("getStartAndEndTokenPrices", () => {
  it("should fetch start and end token price", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        prices: [
          [1622567980899, 0.9954632411776787],
          [1622570866727, 1.0037974623619168],
          [1622574275142, 1.0022713676604735],
        ],
        market_caps: [
          [1622567980899, 22561032089.438694],
          [1622570866727, 22759226878.52222],
          [1622574275142, 22772493358.633835],
        ],
        total_volumes: [
          [1622567980899, 2645486073.0251384],
          [1622570866727, 2636577392.7841797],
          [1622574275142, 2776326393.6250405],
        ],
      })
    );
    const { startPrice, endPrice } = await getStartAndEndTokenPrices(
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      ChainId.MAINNET,
      1622567232,
      1622577232
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.coingecko.com/api/v3/coins/ethereum/contract/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/market_chart/range?vs_currency=usd&from=1622567232&to=1622577232",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    expect(startPrice).toEqual(0.9954632411776787);
    expect(endPrice).toEqual(1.0022713676604735);
  });
});

describe("denominateAs", () => {
  it("should convert an amount of one token to another", async () => {
    // in this case, test usdc to usdc 1:1 conversion
    const token = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const amount = 69;
    const convertedAmount = await denominateAs(
      token,
      token,
      amount,
      1612577232,
      1622577232,
      ChainId.MAINNET
    );
    expect(convertedAmount.amount).toEqual(69);
  });

  it("should not convert if the chain is not supported", async () => {
    const token = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const amount = 69;
    const convertedAmount = await denominateAs(
      token,
      token,
      amount,
      0,
      0,
      ChainId.FANTOM_TESTNET
    );
    expect(convertedAmount.amount).toEqual(amount);
  });

  it("should return the same amount if token contract is not available on the selected chain", async () => {
    const token = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const amount = 69;
    const convertedAmount = await denominateAs(
      token,
      token,
      amount,
      0,
      0,
      ChainId.OPTIMISM_MAINNET
    );
    expect(convertedAmount.amount).toEqual(amount);
  });
});

describe("getStrategyName", () => {
  it("returns LINEAR_QUADRATIC_FUNDING if strategyName is quadraticFunding", () => {
    expect(getStrategyName("quadraticFunding")).toEqual(
      "LINEAR_QUADRATIC_FUNDING"
    );
  });

  it("returns input string if strategyName", () => {
    expect(getStrategyName("hello")).toEqual("hello");
  });
});

describe("groupBy", () => {
  it("groups array of objects by a given property", () => {
    type Pet = { type: string; name: string };

    const pets = [
      { type: "Dog", name: faker.animal.dog },
      { type: "Cat", name: faker.animal.cat },
      { type: "Dog", name: faker.animal.dog },
      { type: "Cat", name: faker.animal.cat },
      { type: "Cat", name: faker.animal.cat },
    ];

    const grouped = groupBy(pets, (pet: Pet) => pet.type);

    expect(grouped.size).toEqual(2);
    expect(grouped.get("Dog").length).toEqual(2);
    expect(grouped.get("Cat").length).toEqual(3);
  });
});

describe("fetchPayoutAddressToProjectIdMapping", () => {
  // TODO
});

describe("fetchProjectIdToPayoutAddressMapping", () => {
  // TODO
});

describe("getStartAndEndTokenPrices", () => {
  expect(isTestnet(ChainId.MAINNET)).toBeFalsy();
  expect(isTestnet(ChainId.FANTOM_MAINNET)).toBeFalsy();
  expect(isTestnet(ChainId.OPTIMISM_MAINNET)).toBeFalsy();
  expect(isTestnet(ChainId.FANTOM_TESTNET)).toBeTruthy();
  expect(isTestnet(ChainId.GOERLI)).toBeTruthy();
});
