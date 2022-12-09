import { QFContribution, RoundMetadata, RoundStats } from "./types";
import { faker } from '@faker-js/faker';

export const mockRoundMetadata: RoundMetadata = {
  votingStrategy: {
    id: faker.finance.ethereumAddress.toString(),
    strategyName: "LINEAR_QUADRATIC_FUNDING"
  },
  roundStartTime: faker.datatype.number(),
  roundEndTime: faker.datatype.number(),
  token: faker.finance.ethereumAddress.toString(),
  totalPot: faker.datatype.number()
}

export const mockQFContribution: QFContribution = {
  projectId: faker.finance.ethereumAddress.toString(),
  amount: faker.datatype.number(),
  contributor: faker.finance.ethereumAddress.toString(),
  timestamp: faker.datatype.number(),
  token: faker.finance.ethereumAddress.toString(),
};

export const mockRoundStats: RoundStats = {
  uniqueContributorCount: faker.datatype.number(),
  contributionsCount: faker.datatype.number(),
  totalContributionsInUSD: faker.datatype.number(),
}