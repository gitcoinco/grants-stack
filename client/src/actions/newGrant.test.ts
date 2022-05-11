import { parseMintEvents } from "./utils/grants";
import { NewGrant } from "../reducers/newGrant";

const mockedEvents = [
  {
      "args": [
          "0x0000000000000000000000000000000000000000",
          "0x753CFB338925fFEca0ad7f0517362D0CD3085d83",
          {
              "type": "BigNumber",
              "hex": "0x0c"
          }
      ],
      "event": "Transfer",
  },
  {
      "args": [
          {
              "type": "BigNumber",
              "hex": "0x0c"
          },
          "0x753CFB338925fFEca0ad7f0517362D0CD3085d83",
          "https://ipfs.io/ipfs/QmSSTFafxkMcEMsY1MsU7uk39XrtgHujTEnZhY4qoKnuNK"
      ],
      "event": "GrantCreated",
  }
]

describe("Grant Nft Action", () => {
  it("parseMintEvents returns grant data from tx hash", () => {
    const grantData: NewGrant | Error = parseMintEvents(mockedEvents);

    expect(grantData).toEqual({
      id: 12,
      ipfsHash: "https://ipfs.io/ipfs/QmSSTFafxkMcEMsY1MsU7uk39XrtgHujTEnZhY4qoKnuNK",
      owner: "0x753CFB338925fFEca0ad7f0517362D0CD3085d83"
    })
  })

  it("parseMintEvents returns error if missing GrantCreated event", () => {
    const missingGrantEvent = [mockedEvents[0]];
    expect(() => parseMintEvents(missingGrantEvent)).toThrow("Unable to find created event");
  })
})
