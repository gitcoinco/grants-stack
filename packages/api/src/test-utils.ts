import { BigNumber } from "ethers";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

import {
  MetaPtr,
  QFContributionSummary,
  QFContribution,
  RoundMetadata,
} from "./types";
import prisma from "./handlers/client";

jest.mock("./handlers/client", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

export const mockProjectMetaPtr: MetaPtr = {
  protocol: 1,
  pointer: "QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ",
};

export const mockRoundMetadata: RoundMetadata = {
  votingStrategy: {
    id: faker.finance.ethereumAddress.toString(),
    strategyName: "LINEAR_QUADRATIC_FUNDING",
  },
  roundStartTime: faker.datatype.number(),
  roundEndTime: faker.datatype.number(),
  token: faker.finance.ethereumAddress.toString(),
  totalPot: faker.datatype.number(),
  projectsMetaPtr: mockProjectMetaPtr,
  ipfs: {
    matchingFunds: {
      matchingCap: faker.datatype.boolean(),
      matchingCapAmount: faker.datatype.number(),
      matchingFundsAvailable: faker.datatype.number(),
    },
    name: faker.lorem.words(),
    support: {},
    eligibility: {},
    programContractAddress: faker.finance.ethereumAddress.toString(),
  },
};

export const mockQFContributionSummary: QFContributionSummary = {
  contributionCount: faker.datatype.number(),
  uniqueContributors: faker.datatype.number(),
  totalContributionsInUSD: faker.datatype.number(),
  averageUSDContribution: faker.datatype.number(),
};

export const mockQFVote: QFContribution = {
  amount: BigNumber.from("1"),
  token: faker.finance.ethereumAddress.toString(),
  contributor: faker.finance.ethereumAddress.toString(),
  projectId: faker.finance.ethereumAddress.toString(),
  projectPayoutAddress: faker.finance.ethereumAddress.toString(),
};
