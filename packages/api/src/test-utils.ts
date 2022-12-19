import { QFContributionSummary, QFVote, RoundMetadata } from "./types";
import { faker } from '@faker-js/faker';
import { BigNumber } from "ethers";

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

export const mockQFContributionSummary: QFContributionSummary = {
  contributionCount: faker.datatype.number(),
  uniqueContributors: faker.datatype.number(),
  totalContributionsInUSD: faker.datatype.number().toString(),
  averageUSDContribution: faker.datatype.number().toString(),
};

export const mockQFVote: QFVote = {
  amount: BigNumber.from("1"),
  token: faker.finance.ethereumAddress.toString(),
  contributor: faker.finance.ethereumAddress.toString(),
  projectId: faker.finance.ethereumAddress.toString(),
};