import { listPrograms } from "../program"
import { Program } from "../types"
import { makeProgramData } from "../../../test-utils"
import { graphql_fetch, fetchFromIPFS } from "../utils"

jest.mock("../utils")

describe("program api", () => {
  it("calls the graphql endpoint and maps the metadata from IPFS", () => {
    const address = "0x0"
    const expectedProgram = makeProgramData()
    const expectedPrograms: Program[] = [
      expectedProgram,
    ];
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        programs: [
          {
            id: expectedProgram.id,
            roles: [
              {
                accounts: {
                  address: address,
                },
              },
            ],
            metaPtr: {
              protocol: 1,
              pointer: "uwijkhxkpkdgkszraqzqvhssqulctxzvntxwconznfkelzbtgtqysrzkehl",
            },
          },
        ],
      },
    });

    (fetchFromIPFS as jest.Mock).mockResolvedValue({
      name: expectedProgram.metadata?.name,
    })


    const actualPrograms = listPrograms(address, {
      getNetwork: async () => Promise.resolve({chainId: "ahjdfaskjlfja"})
    })

    expect(actualPrograms).toEqual(expectedPrograms)
  })
})