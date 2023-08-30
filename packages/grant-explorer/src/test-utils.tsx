import { faker } from "@faker-js/faker";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  RoundContext,
  RoundState,
  initialRoundState,
} from "./context/RoundContext";
import { RoundMetadata } from "./features/api/round";
import { RoundOverview } from "./features/api/rounds";
import {
  ApplicationStatus,
  CartProject,
  ProjectMetadata,
  Round,
} from "./features/api/types";
import { parseUnits } from "viem";

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
    status: ApplicationStatus.APPROVED,
    applicationIndex: faker.datatype.number(),
    roundId: faker.finance.ethereumAddress(),
    chainId: 1,
    ...overrides,
  };
};

export const makeRoundOverviewData = (
  overrides?: Partial<RoundOverview>,
  roundMetadataOverrides?: Partial<RoundMetadata>
): RoundOverview => {
  return {
    id: faker.finance.ethereumAddress(),
    chainId: "1",
    roundMetaPtr: {
      protocol: 1,
      pointer: generateIpfsCid(),
    },
    applicationMetaPtr: {
      protocol: 1,
      pointer: generateIpfsCid(),
    },
    applicationsStartTime: faker.date.soon().toString(),
    applicationsEndTime: faker.date.soon(10).toString(),
    roundStartTime: faker.date.soon(20).toString(),
    roundEndTime: faker.date.soon(30).toString(),
    matchAmount: "1000000000000000000000000",
    token: faker.finance.ethereumAddress(),
    roundMetadata: {
      name: faker.company.name(),
      roundType: "private",
      eligibility: {
        description: faker.lorem.sentence(),
        requirements: [
          { requirement: faker.lorem.sentence() },
          { requirement: faker.lorem.sentence() },
        ],
      },
      programContractAddress: faker.finance.ethereumAddress(),
      ...roundMetadataOverrides,
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
) =>
  render(
    <MemoryRouter>
      <RoundContext.Provider
        value={{
          state: { ...initialRoundState, ...roundStateOverrides },
          dispatch,
        }}
      >
        {ui}
      </RoundContext.Provider>
    </MemoryRouter>
  );

export const mockBalance = {
  data: {
    value: parseUnits("10", 18),
  },
};

export const mockSigner = {
  data: {},
};

export const mockNetwork = {
  chain: { id: 5, name: "Goerli" },
  chains: [
    { id: 10, name: "Optimism" },
    { id: 5, name: "Goerli" },
  ],
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
