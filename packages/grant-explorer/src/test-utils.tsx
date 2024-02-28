import { Mocked } from "vitest";
import { faker } from "@faker-js/faker";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import {
  initialRoundState,
  RoundContext,
  RoundState,
} from "./context/RoundContext";
import { __deprecated_RoundMetadata } from "./features/api/round";
import { CartProject, ProjectMetadata, Round } from "./features/api/types";
import { parseUnits } from "viem";
import { ChainId } from "common";
import { DataLayer, DataLayerProvider, RoundGetRound } from "data-layer";

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
      strategyName: "allov1.QF",
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
      lastUpdated: 0,
      credentials: {},
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
  overrides?: Partial<RoundGetRound>,
  roundMetadataOverrides?: Partial<__deprecated_RoundMetadata>
): RoundGetRound => {
  return {
    id: faker.finance.ethereumAddress(),
    chainId: ChainId.MAINNET,
    createdAtBlock: 1,
    roundMetadataCid: generateIpfsCid(),
    applicationsStartTime: makeTimestamp(),
    applicationsEndTime: makeTimestamp(10),
    donationsStartTime: makeTimestamp(20),
    donationsEndTime: makeTimestamp(30),
    matchAmountInUsd: 1000000000000000000000000,
    matchAmount: "1000000000000000000000000",
    matchTokenAddress: faker.finance.ethereumAddress(),
    roundMetadata: makeRoundMetadata(roundMetadataOverrides),
    applications: Array.from({ length: 2 }).map((_, i) => ({ id: String(i) })),
    strategyName: "allov1.QF",
    strategyAddress: faker.finance.ethereumAddress(),
    strategyId: "",
    tags: [],
    ...overrides,
  };
};

export function generateIpfsCid() {
  return faker.random.alpha({ count: 59, casing: "lower" });
}

export const renderWithContext = (
  ui: React.ReactNode,
  overrides?: {
    dispatch?: () => void;
    dataLayer?: DataLayer;
    roundState?: Partial<RoundState>;
  }
) => {
  const dispatch = overrides?.dispatch ?? vi.fn();
  const dataLayerMock =
    overrides?.dataLayer ??
    ({
      getSearchBasedProjectCategories: vi.fn().mockResolvedValue([
        {
          id: "open-source",
          name: "Open source",
          images: [
            "/assets/categories/category_01.jpg",
            "/assets/categories/category_02.jpg",
            "/assets/categories/category_03.jpg",
            "/assets/categories/category_04.jpg",
          ],
          searchQuery: "open source, open source software",
        },
      ]),
      getProjectCollections: vi.fn().mockResolvedValue([
        {
          id: "first-time-grantees",
          author: "Gitcoin",
          name: "First Time Grantees",
          images: [
            "/assets/collections/collection_01.jpg",
            "/assets/collections/collection_02.jpg",
            "/assets/collections/collection_03.jpg",
            "/assets/collections/collection_04.jpg",
          ],
          description:
            "This collection showcases all grantees in GG19 that have not participated in a past round on Grants Stack! Give these first-time grantees some love (and maybe some donations, too!).",
          applicationRefs: [
            "10:0x36f548e082b09b0cec5b3f5a7b78953c75de5e74:2",
            "10:0x36f548e082b09b0cec5b3f5a7b78953c75de5e74:8",
          ],
        },
        {
          id: "grants-stack-veterans",
          author: "Gitcoin",
          name: "Grants Stack Veterans",
          images: [
            "/assets/collections/collection_05.jpg",
            "/assets/collections/collection_06.jpg",
          ],
          description:
            "This collection showcases all grantees in GG19 that have participated in a past GG18 and/or Beta Round! Give these Grants Stack Veterans some love (and maybe some donations, too!).",
          applicationRefs: [
            "10:0x36f548e082b09b0cec5b3f5a7b78953c75de5e74:1",
            "10:0x4727e3265706c59dbc31e7c518960f4f843bb4da:16",
          ],
        },
      ]),
    } as unknown as Mocked<DataLayer>);

  return render(
    <ChakraProvider>
      <MemoryRouter>
        <DataLayerProvider client={dataLayerMock}>
          <RoundContext.Provider
            value={{
              state: { ...initialRoundState, ...overrides?.roundState },
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
