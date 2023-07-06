import { getProgramById, listPrograms } from "../program";
import { Program } from "../types";
import { makeProgramData } from "../../../test-utils";
import { fetchFromIPFS, CHAINS } from "../utils";
import { graphql_fetch } from "common";
import { ChainId } from "common";

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  fetchFromIPFS: jest.fn(),
}));

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  graphql_fetch: jest.fn(),
}));

describe("listPrograms", () => {
  it("calls the graphql endpoint and maps the metadata from IPFS", async () => {
    // const address = "0x0"
    const expectedProgram = makeProgramData({
      chain: CHAINS[ChainId.GOERLI_CHAIN_ID],
    });
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
      getNetwork: async () =>
        // @ts-expect-error Test file
        Promise.resolve({ chainId: ChainId.GOERLI_CHAIN_ID }),
    });

    expect(actualPrograms).toEqual(expectedPrograms);
  });
});

describe("getProgramById", () => {
  it("calls the graphql endpoint and maps the metadata from IPFS", async () => {
    const expectedProgram = makeProgramData({
      chain: CHAINS[ChainId.GOERLI_CHAIN_ID],
    });
    const programId = expectedProgram.id;
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

    const actualProgram = await getProgramById(programId as string, {
      getNetwork: async () =>
        // @ts-expect-error Test file
        Promise.resolve({ chainId: ChainId.GOERLI_CHAIN_ID }),
    });

    expect(actualProgram).toEqual(expectedProgram);
    const graphqlFetchCall = (graphql_fetch as jest.Mock).mock.calls[0];
    const actualQuery = graphqlFetchCall[0];
    expect(actualQuery).toContain("id: $programId");
  });
});
