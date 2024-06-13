import { DataLayer } from "data-layer";
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

    const actualPrograms = await listPrograms("0x0", 1, {
      getRoundsByProgramIdAndChainId: jest
        .fn()
        .mockRejectedValue(new Error(":(")),
    } as unknown as DataLayer);

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

    const actualProgram = await getProgramById(programId as string, 1, {
      getRoundsByProgramIdAndChainId: jest
        .fn()
        .mockRejectedValue(new Error(":(")),
    } as unknown as DataLayer);

    expect(actualProgram).toEqual(expectedProgram);
  });
});
