import { enableFetchMocks, FetchMock } from "jest-fetch-mock";

import { ChainId } from "common";
import { fetchFromIPFS, generateApplicationSchema, pinToIPFS } from "../utils";

import { graphql_fetch } from "common";
import {
  initialQuestionsQF,
  initialRequirements,
} from "../../round/RoundApplicationForm";

enableFetchMocks();

const fetchMock = fetch as FetchMock;

describe("fetchFromIPFS", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should return data from IPFS", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ name: "My First Metadata" }));

    const cid = "bafkreih475g3yk67xjenvlatgumnbtqay7edgyrxevoqzihjltjm3f6cf4";

    const res = await fetchFromIPFS(cid);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`
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
      `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`
    );
  });
});

describe("pinToIPFS", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should pin JSON data to IPFS", async () => {
    const cid = "bafkreih475g3yk67xjenvlatgumnbtqay7edgyrxevoqzihjltjm3f6cf4";

    fetchMock.mockResponseOnce(
      JSON.stringify({
        IpfsHash: cid,
        PinSize: 1024,
        TimeStamp: new Date().toISOString(),
      })
    );

    const ipfsObject = {
      content: {
        name: "My First Program",
      },
      metadata: {
        name: "program-metadata",
      },
    };

    const res = await pinToIPFS(ipfsObject);

    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataMetadata: ipfsObject.metadata,
        pinataOptions: {
          cidVersion: 1,
        },
        pinataContent: ipfsObject.content,
      }),
    };

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      params
    );
    expect(res.IpfsHash).toEqual(cid);
  });

  it("should pin blob data to IPFS", async () => {
    const cid = "bafkreih475g3yk67xjenvlatgumnbtqay7edgyrxevoqzihjltjm3f6cf4";

    fetchMock.mockResponseOnce(
      JSON.stringify({
        IpfsHash: cid,
        PinSize: 1024,
        TimeStamp: new Date().toISOString(),
      })
    );

    const ipfsObject = {
      content: new Blob([]),
      metadata: {
        name: "program-metadata",
      },
    };

    const res = await pinToIPFS(ipfsObject);

    const fd = new FormData();
    fd.append("file", ipfsObject.content as Blob);
    fd.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      })
    );
    fd.append("pinataMetadata", JSON.stringify(ipfsObject.metadata));

    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
      },
      body: fd,
    };

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      params
    );
    expect(res.IpfsHash).toEqual(cid);
  });

  it("should reject upon failure to pin blob data", async () => {
    fetchMock.mockResponseOnce("", {
      status: 403,
    }); /*Common error-expired API credentials*/

    const ipfsObject = {
      content: new Blob([]),
      metadata: {
        name: "program-metadata",
      },
    };

    await expect(pinToIPFS(ipfsObject)).rejects.toHaveProperty("status", 403);

    const fd = new FormData();
    fd.append("file", ipfsObject.content);
    fd.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      })
    );
    fd.append("pinataMetadata", JSON.stringify(ipfsObject.metadata));

    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
      },
      body: fd,
    };

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      params
    );
  });

  it("should reject upon failure to pin json data", async () => {
    fetchMock.mockResponseOnce("", {
      status: 403,
    }); /*Common error-expired API credentials*/

    const cid = "bafkreih475g3yk67xjenvlatgumnbtqay7edgyrxevoqzihjltjm3f6cf4";

    fetchMock.mockResponseOnce(
      JSON.stringify({
        IpfsHash: cid,
        PinSize: 1024,
        TimeStamp: new Date().toISOString(),
      })
    );

    const ipfsObject = {
      content: {
        name: "My First Program",
      },
      metadata: {
        name: "program-metadata",
      },
    };

    await expect(pinToIPFS(ipfsObject)).rejects.toHaveProperty("status", 403);

    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataMetadata: ipfsObject.metadata,
        pinataOptions: {
          cidVersion: 1,
        },
        pinataContent: ipfsObject.content,
      }),
    };

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      params
    );
  });
});

describe("graphql_fetch", () => {
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

    const res = await graphql_fetch(query, ChainId.MAINNET);

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
      `${process.env.REACT_APP_SUBGRAPH_MAINNET_API}`,
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

    await expect(graphql_fetch(query, ChainId.MAINNET)).rejects.toHaveProperty(
      "status",
      400
    );

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
      `${process.env.REACT_APP_SUBGRAPH_MAINNET_API}`,
      params
    );
  });

  it("should fetch data from the correct graphql endpoint for optimism network", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        data: {},
      })
    );

    await graphql_fetch(`programs { id }`, ChainId.OPTIMISM_MAINNET_CHAIN_ID);

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`,
      expect.anything()
    );
  });
});

describe("generateApplicationSchema", () => {
  it("should return valid application schema", () => {
    const expectedSchema = {
      questions: initialQuestionsQF
        .filter((q) => !q.metadataExcluded)
        .map((question) => ({
          title: question.title,
          type: question.type,
          required: question.required,
          hidden: question.hidden,
          info: "", // TODO: is grant hub using this???
          choices: undefined, // TODO: is grant hub using this???
          encrypted: question.encrypted,
        })),
      requirements: {
        twitter: {
          required: false,
          verification: false,
        },
        github: {
          required: false,
          verification: false,
        },
      },
    };

    const schema = generateApplicationSchema(
      initialQuestionsQF,
      initialRequirements
    );

    expect(Array.isArray(schema.questions)).toBe(true);
    expect(schema).toMatchObject(expectedSchema);
  });
});
