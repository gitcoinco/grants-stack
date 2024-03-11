import { faker } from "@faker-js/faker";
import { describe, expect, test } from "vitest";
import { RoundMetadata, RoundOverview } from "..";
import { cleanRoundData, sortRounds } from "./legacy";

// TODO switch to ESM and move these tests into `legacy.ts` using in-source test
// definition with `import.meta.vitest`

describe("legacy", () => {
  const MOCKED_ROUNDS_COUNT = 5;

  const MOCKED_ROUNDS = Array.from({ length: MOCKED_ROUNDS_COUNT }).map(() =>
    generateRoundOverviewData(),
  );

  const DEFAULT_FILTER = {
    orderBy: "",
    orderDirection: "",
    status: "",
    network: "",
    type: "",
  } as const;

  test("cleanRoundData", async () => {
    expect(
      // Fix milliseconds to seconds
      cleanRoundData([
        {
          ...MOCKED_ROUNDS[0],
          // Multiply by 1000 and check that it's still the value in seconds
          roundStartTime: String(+MOCKED_ROUNDS[0].roundStartTime * 1000),
        },
      ])[0].roundStartTime,
    ).toBe(MOCKED_ROUNDS[0].roundStartTime);

    expect(
      // Fix overflowed timestamp
      cleanRoundData([
        {
          ...MOCKED_ROUNDS[0],
          // Multiply by 1000 and check that it's still the value in seconds
          roundStartTime:
            "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        },
      ])[0].roundStartTime,
    ).toBeUndefined();
  });

  test("sortRounds", async () => {
    const sortedAsc = sortRounds(
      [{ matchAmount: "10" }, { matchAmount: "1" }] as RoundOverview[],
      {
        ...DEFAULT_FILTER,
        orderBy: "matchAmount",
        orderDirection: "asc",
      },
    );
    expect(sortedAsc[0].matchAmount).toBe("1");
    expect(sortedAsc[1].matchAmount).toBe("10");

    const sortedDesc = sortRounds(
      [{ matchAmount: "10" }, { matchAmount: "1" }] as RoundOverview[],
      {
        ...DEFAULT_FILTER,
        orderBy: "matchAmount",
        orderDirection: "desc",
      },
    );
    expect(sortedDesc[0].matchAmount).toBe("10");
    expect(sortedDesc[1].matchAmount).toBe("1");
  });
});

const generateRoundOverviewData = (
  overrides?: Partial<RoundOverview>,
  roundMetadataOverrides?: Partial<RoundMetadata>,
): RoundOverview => {
  return {
    id: faker.finance.ethereumAddress(),
    chainId: 1,
    createdAt: generateTimestamp(),
    roundMetaPtr: {
      protocol: 1,
      pointer: generateIpfsCid(),
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: generateIpfsCid(),
    },
    applicationsStartTime: generateTimestamp(),
    applicationsEndTime: generateTimestamp(10),
    roundStartTime: generateTimestamp(20),
    roundEndTime: generateTimestamp(30),
    matchAmount: "1000000000000000000000000",
    token: faker.finance.ethereumAddress(),
    roundMetadata: generateRoundMetadata(roundMetadataOverrides),
    projects: Array.from({ length: 2 }).map((_, i) => ({ id: String(i) })),
    payoutStrategy: {
      id: "someid",
      strategyName: "allov1.QF",
    },
    ...overrides,
  };
};

const generateIpfsCid = (): string => {
  return faker.string.alpha({ length: { min: 59, max: 59 }, casing: "lower" });
};

const generateTimestamp = (days?: number): string =>
  Math.floor(Number(faker.date.soon({ days })) / 1000).toString();

const generateRoundMetadata = (
  overrides?: Partial<RoundMetadata>,
): RoundMetadata => ({
  name: faker.company.name(),
  roundType: "public",
  eligibility: {
    description: faker.lorem.sentence(),
    requirements: [
      { requirement: faker.lorem.sentence() },
      { requirement: faker.lorem.sentence() },
    ],
  },
  programContractAddress: faker.finance.ethereumAddress(),
  ...overrides,
});
