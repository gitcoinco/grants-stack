import { Mocked } from "vitest";
import { faker } from "@faker-js/faker";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import {
  RoundContext,
  RoundState,
  initialRoundState,
} from "./context/RoundContext";
import { __deprecated_RoundMetadata } from "./features/api/round";
import { RoundOverview } from "./features/api/rounds";
import { CartProject, ProjectMetadata, Round } from "./features/api/types";
import { parseUnits } from "viem";
import { ChainId } from "common";
import { DataLayer, DataLayerProvider } from "data-layer";

export const makeRoundData = (overrides: Partial<Round> = {}): Round => {
  const applicationsStartTime = faker.date.soon();
  const applicationsEndTime = faker.date.soon(10, applicationsStartTime);
  const roundStartTime = faker.date.future(1, applicationsEndTime);
  const roundEndTime = faker.date.soon(21, roundStartTime);

  // NB: set to seconds-level granularity for easier conversion and test assertions
  [
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
  ].forEach((date: Date) => {
    date.setMilliseconds(0);
  });

  return {
    id: faker.finance.ethereumAddress(),
    roundMetadata: {
      name: faker.company.name(),
      roundType: "private",
      eligibility: { description: "name", requirements: [] },
      programContractAddress: faker.finance.ethereumAddress(),
      quadraticFundingConfig: {
        matchingFundsAvailable: 99999,
        matchingCap: false,
        matchingCapAmount: 0,
        minDonationThreshold: false,
        minDonationThresholdAmount: 0,
        sybilDefense: true,
      },
    },
    store: {
      protocol: 1,
      pointer: generateIpfsCid(),
    },
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
    token: faker.finance.ethereumAddress(),
    payoutStrategy: {
      id: "some-id",
      strategyName: "MERKLE",
    },
    votingStrategy: faker.finance.ethereumAddress(),
    ownedBy: faker.finance.ethereumAddress(),
    ...overrides,
  };
};

export const makeApprovedProjectData = (
  overrides?: Partial<CartProject>,
  projectMetadataOverrides?: Partial<ProjectMetadata>
): CartProject => {
  return {
    amount: "",
    grantApplicationId: `${faker.finance.ethereumAddress()}-${faker.finance.ethereumAddress()}`,
    grantApplicationFormAnswers: [],
    projectRegistryId: faker.datatype.number().toString(),
    recipient: faker.finance.ethereumAddress(),
    projectMetadata: {
      title: faker.company.name(),
      description: faker.lorem.sentence(),
      website: faker.internet.url(),
      projectTwitter: faker.internet.userName(),
      createdAt: new Date().valueOf(),
      projectGithub: faker.internet.userName(),
      userGithub: faker.internet.userName(),
      owners: [{ address: faker.finance.ethereumAddress() }],
      ...projectMetadataOverrides,
    },
    status: "APPROVED",
    applicationIndex: faker.datatype.number(),
    roundId: faker.finance.ethereumAddress(),
    chainId: ChainId.MAINNET,
    ...overrides,
  };
};

const makeTimestamp = (days?: number) =>
  Math.floor(Number(faker.date.soon(days)) / 1000).toString();

export const makeRoundMetadata = (
  overrides?: Partial<__deprecated_RoundMetadata>
): __deprecated_RoundMetadata => ({
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

export const makeRoundOverviewData = (
  overrides?: Partial<RoundOverview>,
  roundMetadataOverrides?: Partial<__deprecated_RoundMetadata>
): RoundOverview => {
  return {
    id: faker.finance.ethereumAddress(),
    chainId: ChainId.MAINNET,
    createdAt: makeTimestamp(),
    roundMetaPtr: {
      protocol: 1,
      pointer: generateIpfsCid(),
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: generateIpfsCid(),
    },
    applicationsStartTime: makeTimestamp(),
    applicationsEndTime: makeTimestamp(10),
    roundStartTime: makeTimestamp(20),
    roundEndTime: makeTimestamp(30),
    matchAmount: "1000000000000000000000000",
    token: faker.finance.ethereumAddress(),
    roundMetadata: makeRoundMetadata(roundMetadataOverrides),
    projects: Array.from({ length: 2 }).map((_, i) => ({ id: String(i) })),
    payoutStrategy: {
      id: "someid",
      strategyName: "MERKLE",
    },
    ...overrides,
  };
};

export function generateIpfsCid() {
  return faker.random.alpha({ count: 59, casing: "lower" });
}

export const renderWithContext = (
  ui: JSX.Element,
  roundStateOverrides: Partial<RoundState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = vi.fn()
) => {
  const dataLayerMock = {
    query: vi.fn().mockResolvedValue({
      round:
        roundStateOverrides.rounds !== undefined &&
        roundStateOverrides.rounds.length > 0
          ? roundStateOverrides.rounds[0]
          : undefined,
    }),
  } as unknown as Mocked<DataLayer>;

  return render(
    <ChakraProvider>
      <MemoryRouter>
        <DataLayerProvider client={dataLayerMock}>
          <RoundContext.Provider
            value={{
              state: { ...initialRoundState, ...roundStateOverrides },
              dispatch,
            }}
          >
            {ui}
          </RoundContext.Provider>
        </DataLayerProvider>
      </MemoryRouter>
    </ChakraProvider>
  );
};
export const mockBalance = {
  data: {
    value: parseUnits("10", 18),
  },
};

export const mockSigner = {
  data: {},
};

export const mockNetwork = {
  chain: { id: 10, name: "Optimism" },
  chains: [{ id: 10, name: "Optimism" }],
};

export const setWindowDimensions = (width: number, height: number): void => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });

  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });

  window.dispatchEvent(new Event("resize"));
};

// deviceRenderer.ts
export type DeviceType = "mobile" | "tablet" | "desktop";

export const renderComponentsBasedOnDeviceSize = (): DeviceType => {
  const deviceWidth = window.innerWidth;

  if (deviceWidth <= 480) {
    return "mobile";
  } else if (deviceWidth > 480 && deviceWidth <= 1024) {
    return "tablet";
  } else {
    return "desktop";
  }
};
