import { enableFetchMocks, FetchMock } from "jest-fetch-mock";
import { ChainId } from "../types";
import { fetchFromIPFS, fetchFromGraphQL} from "../utils";
enableFetchMocks();

const fetchMock = fetch as FetchMock;

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

    const res = await fetchFromGraphQL(ChainId.GOERLI_CHAIN_ID, query);

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
      fetchFromGraphQL(ChainId.GOERLI_CHAIN_ID, query)
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

    await fetchFromGraphQL(ChainId.OPTIMISM_MAINNET_CHAIN_ID, `programs { id }`,);

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`,
      expect.anything()
    );
  });
});