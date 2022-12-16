import { RoundMetadata } from "./types";
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