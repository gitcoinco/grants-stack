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

jest.mock("data-layer", () => ({
  DataLayer: jest.fn().mockImplementation(() => ({
    getProgramsByUser: jest.fn().mockResolvedValue({
      programs: [],
    }),
  })),
}));

describe("listPrograms", () => {
  it("calls the indexer endpoint", async () => {
    // const address = "0x0"
    const expectedProgram = makeProgramData({
      chain: CHAINS[ChainId.MAINNET],
    });
    const expectedPrograms: Program[] = [expectedProgram];

    const actualPrograms = await listPrograms(
      "0x0",
      {
        getNetwork: async () =>
          // @ts-expect-error Test file
          Promise.resolve({ chainId: ChainId.MAINNET }),
      },
      {
        getProgramsByUser: jest.fn().mockResolvedValue({
          programs: [
            {
              id: expectedProgram.id,
              roles: [{ address: expectedProgram.operatorWallets[0] }],
              metadata: {
                name: expectedProgram.metadata?.name,
              },
            },
          ],
        }),
      }
    );

    expect(actualPrograms).toEqual(expectedPrograms);
  });
});

describe("getProgramById", () => {
  it("calls the graphql endpoint and maps the metadata from IPFS", async () => {
    const expectedProgram = makeProgramData({
      chain: CHAINS[ChainId.MAINNET],
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
        Promise.resolve({ chainId: ChainId.MAINNET }),
    });

    expect(actualProgram).toEqual(expectedProgram);
    const graphqlFetchCall = (graphql_fetch as jest.Mock).mock.calls[0];
    const actualQuery = graphqlFetchCall[0];
    expect(actualQuery).toContain("id: $programId");
  });
});
