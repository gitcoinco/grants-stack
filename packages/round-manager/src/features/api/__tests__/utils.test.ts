import { enableFetchMocks, FetchMock } from 'jest-fetch-mock'
enableFetchMocks()

import { fetchFromIPFS, pinToIPFS } from "../utils"

const fetchMock = fetch as FetchMock


describe('fetchFromIPFS', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it('should return data from IPFS', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ name: "My First Metadata" }))

    const cid = "bafkreih475g3yk67xjenvlatgumnbtqay7edgyrxevoqzihjltjm3f6cf4"

    const res = await fetchFromIPFS(cid)

    expect(fetchMock).toHaveBeenCalledWith(
      `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${cid}`
    )
    expect(res).toEqual({ name: "My First Metadata" })
  })
})


describe('pinToIPFS', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it('should pin JSON data to IPFS', async () => {
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
