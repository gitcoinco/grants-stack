import { getChainById } from "common";
import { makeProgramData } from "../../../test-utils";
import { getProgramById, listPrograms } from "../program";
import { Program } from "../types";

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
      chain: {
        id: 1,
        name: "Ethereum",
      },
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
          Promise.resolve({ chainId: 1 }),
      },
      {
        getProgramsByUser: jest.fn().mockResolvedValue({
          programs: [
            {
              id: expectedProgram.id,
              roles: [
                {
                  address: expectedProgram.operatorWallets[0],
                  role: "OWNER",
                  createdAtBlock: "0",
                },
              ],
              metadata: {
                name: expectedProgram.metadata?.name,
              },
              createdByAddress: expectedProgram.operatorWallets[0],
              tags: ["program"],
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
      chain: {
        name: "Ethereum",
        id: 1,
      },
    });
    const programId = expectedProgram.id;

    const actualProgram = await getProgramById(
      programId as string,
      {
        getNetwork: async () =>
          // @ts-expect-error Test file
          Promise.resolve({ chainId: 1 }),
      },
      {
        getProgramById: jest.fn().mockResolvedValue({
          program: {
            id: expectedProgram.id,
            roles: [
              {
                address: expectedProgram.operatorWallets[0],
                role: "OWNER",
                createdAtBlock: "0",
              },
            ],
            metadata: {
              name: expectedProgram.metadata?.name,
            },
            tags: ["program"],
          },
        }),
      }
    );

    expect(actualProgram).toEqual(expectedProgram);
  });
});
