import { enableFetchMocks, FetchMock } from "jest-fetch-mock"

import { ChainId, fetchFromIPFS, graphql_fetch, pinToIPFS } from "../utils"

enableFetchMocks()

const fetchMock = fetch as FetchMock

describe("fetchFromIPFS", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it("should return data from IPFS", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ name: "My First Metadata" }))

    const cid = "bafkreih475g3yk67xjenvlatgumnbtqay7edgyrxevoqzihjltjm3f6cf4"

    const res = await fetchFromIPFS(cid)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`
    )
    expect(res).toEqual({ name: "My First Metadata" })
  })
})


describe("pinToIPFS", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it("should pin JSON data to IPFS", async () => {
    const cid = "bafkreih475g3yk67xjenvlatgumnbtqay7edgyrxevoqzihjltjm3f6cf4"

    fetchMock.mockResponseOnce(JSON.stringify({
      IpfsHash: cid,
      PinSize: 1024,
      TimeStamp: (new Date()).toISOString()
    }))

    const ipfsObject = {
      content: { name: "My First Program" },
      metadata: {
        name: "program-metadata"
      }
    }

    const res = await pinToIPFS(ipfsObject)

    const params = {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pinataMetadata: ipfsObject.metadata,
        pinataOptions: {
          cidVersion: 1
        },
        pinataContent: ipfsObject.content
      }),
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      params
    )
    expect(res.IpfsHash).toEqual(cid)
  })
})

describe("graphql_fetch", () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it("should return data from a graphql endpoint", async () => {
    fetchMock.resetMocks()

    fetchMock.mockResponseOnce(JSON.stringify({
      data: {
        programs: [
          { id: "0x123456789544fe81379e2951623f008d200e1d18" },
          { id: "0x123456789567fe81379e2951623f008d200e1d20" }
        ]
      }
    }))

    const query = `
      programs {
        id
      }
    `

    const res = await graphql_fetch(query, ChainId.GOERLI_CHAIN_ID)

    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        variables: {}
      }),
    }

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SUBGRAPH_GOERLI_API}`,
      params
    )
    expect(res.data.programs[0]).toEqual(
      { id: "0x123456789544fe81379e2951623f008d200e1d18" }
    )
  })

  it("should fetch data from the correct graphql endpoint for optimism-kovan network", async () => {
    fetchMock.resetMocks()

    fetchMock.mockResponseOnce(JSON.stringify({
      data: {}
    }))

    await graphql_fetch(`programs { id }`, ChainId.OPTIMISM_KOVAN_CHAIN_ID)

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_KOVAN_API}`,
      expect.anything()
    )
  })

  it("should fetch data from the correct graphql endpoint for optimism network", async () => {
    fetchMock.resetMocks()

    fetchMock.mockResponseOnce(JSON.stringify({
      data: {}
    }))

    await graphql_fetch(`programs { id }`, ChainId.OPTIMISM_MAINNET_CHAIN_ID)

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SUBGRAPH_OPTIMISM_MAINNET_API}`,
      expect.anything()
    )
  })
})
