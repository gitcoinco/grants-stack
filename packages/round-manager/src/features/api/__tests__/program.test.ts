import { listPrograms } from "../program";
import { Program } from "../types";
import { makeProgramData } from "../../../test-utils";
import { graphql_fetch, fetchFromIPFS } from "../utils";

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  graphql_fetch: jest.fn(),
  fetchFromIPFS: jest.fn(),
}));

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  graphql_fetch: jest.fn(),
  fetchFromIPFS: jest.fn(),
}));

describe("program api", () => {
  it("calls the graphql endpoint and maps the metadata from IPFS", async () => {
    // const address = "0x0"
    const expectedProgram = makeProgramData();
    const expectedPrograms: Program[] = [expectedProgram];
    (graphql_fetch as jest.Mock).mockResolvedValue({
      data: {
        programs: [
          {
            id: expectedProgram.id,
            roles: [
              {
                accounts: [
                  {
                    address: expectedProgram.operatorWallets[0],
                  },
                ],
              },
            ],
            metaPtr: {
              protocol: 1,
              pointer:
                "uwijkhxkpkdgkszraqzqvhssqulctxzvntxwconznfkelzbtgtqysrzkehl",
            },
          },
        ],
      },
    });

    (fetchFromIPFS as jest.Mock).mockResolvedValue({
      name: expectedProgram.metadata?.name,
    });

    const actualPrograms = await listPrograms("0x0", {
      getNetwork: async () => Promise.resolve({ chainId: "ahjdfaskjlfja" }),
    });

    expect(actualPrograms).toEqual(expectedPrograms);
  });
});
