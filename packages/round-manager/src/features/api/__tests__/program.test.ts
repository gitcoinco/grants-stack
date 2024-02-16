import { getProgramById, listPrograms } from "../program";
import { Program } from "../types";
import { makeProgramData } from "../../../test-utils";
import { CHAINS } from "../utils";
import { ChainId } from "common";
import { zeroAddress } from "viem";

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

    const actualProgram = await getProgramById(
      zeroAddress,
      programId as string,
      {
        getNetwork: async () =>
          // @ts-expect-error Test file
          Promise.resolve({ chainId: ChainId.MAINNET }),
      },
      {
        getProgramByIdAndUser: jest.fn().mockResolvedValue({
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
