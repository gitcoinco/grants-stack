import { ChainId } from "common";
import { makeProgramData } from "../../../test-utils";
import { getProgramById, listPrograms } from "../program";
import { Program } from "../types";
import { CHAINS } from "../utils";

jest.mock("data-layer", () => ({
  ...jest.requireActual("data-layer"),
  DataLayer: jest.fn().mockImplementation(() => ({
    getProgramsByUser: jest.fn().mockResolvedValue({
      programs: [],
    }),
  })),
}));

describe("listPrograms", () => {
  it("calls the indexer endpoint", async () => {
    // const address = "0x0"
    let expectedProgram = makeProgramData({
      chain: CHAINS[ChainId.MAINNET],
    });
    expectedProgram = {
      ...expectedProgram,
      createdByAddress: expectedProgram.operatorWallets[0],
    };
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
              createdByAddress: expectedProgram.operatorWallets[0],
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

    const actualProgram = await getProgramById(
      programId as string,
      {
        getNetwork: async () =>
          // @ts-expect-error Test file
          Promise.resolve({ chainId: ChainId.MAINNET }),
      },
      {
        getProgramById: jest.fn().mockResolvedValue({
          program: {
            id: expectedProgram.id,
            roles: [{ address: expectedProgram.operatorWallets[0] }],
            metadata: {
              name: expectedProgram.metadata?.name,
            },
          },
        }),
      }
    );

    expect(actualProgram).toEqual(expectedProgram);
  });
});
