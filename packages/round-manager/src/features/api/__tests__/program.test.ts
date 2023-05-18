import { getProgramById, listPrograms } from "../program";
import { Program } from "../types";
import { makeProgramData } from "../../../test-utils";
import { fetchFromIPFS, ChainId, CHAINS } from "../utils";
import { graphql_fetch } from "common";

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  fetchFromIPFS: jest.fn(),
}));

jest.mock("common", () => ({
  ...jest.requireActual("common"),
  graphql_fetch: jest.fn(),
}));

jest.mock("wagmi", () => ({
  ...jest.requireActual("wagmi"),
  usePublicClient: () => ({
    getChainId: () => 5,
  }),
}));

describe("listPrograms", () => {
  it("calls the graphql endpoint and maps the metadata from IPFS", async () => {
    const expectedProgram = makeProgramData({
      chain: CHAINS[ChainId.GOERLI_CHAIN_ID],
    });
    const expectedPrograms: Program[] = [expectedProgram];
    (graphql_fetch as jest.Mock).mockResolvedValueOnce({
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

    (fetchFromIPFS as jest.Mock).mockResolvedValueOnce({
      name: expectedProgram.metadata?.name,
    });

    // @ts-expect-error Mock public client
    const actualPrograms = await listPrograms("0x0", {
      getChainId: async () => 5,
    });

    expect(actualPrograms).toEqual(expectedPrograms);
  });
});

describe("getProgramById", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

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

    // @ts-expect-error Mock public client
    const actualProgram = await getProgramById(programId as string, {
      getChainId: async () => 5,
    });

    expect(actualProgram).toEqual(expectedProgram);
    const graphqlFetchCall = (graphql_fetch as jest.Mock).mock.calls[0];
    const actualQuery = graphqlFetchCall[0];
    expect(actualQuery).toContain("id: $programId");
  });
});
