import React from "react"
import { GrantApplication, Program, ProjectStatus } from "./features/api/types"
import { randomInt } from "crypto"
import { faker } from "@faker-js/faker"

export const makeProgramData = (overrides: Partial<Program> = {}): Program => ({
  id: faker.finance.ethereumAddress(),
  metadata: {
    name: faker.company.bsBuzz()
  },
  store: {
    protocol: randomInt(1, 10),
    pointer: faker.random.alpha({ count: 59, casing: "lower" })
  },
  operatorWallets: [
    faker.finance.ethereumAddress()
  ],
  ...overrides
})

export const makeGrantApplicationData = (overrides: Partial<GrantApplication> = {}): GrantApplication => ({
    id: faker.random.alpha({ count: 10, casing: "lower" }),
    round: faker.random.alpha({ count: 59, casing: "lower" }),
    recipient: faker.finance.ethereumAddress(),
    project: {
      lastUpdated: 1659714564,
      id: faker.random.alpha({ count: 10, casing: "lower" }),
      title: faker.lorem.sentence(2),
      description: faker.lorem.sentence(10),
      website: faker.internet.domainName(),
      bannerImg: faker.random.alpha({ count: 59, casing: "lower" }),
      logoImg: faker.random.alpha({ count: 59, casing: "lower" }),
      metaPtr: {
        protocol: randomInt(1, 10),
        pointer: faker.random.alpha({ count: 59, casing: "lower" }),
      }
    },
    answers: [],
    projectsMetaPtr: {
      protocol: randomInt(1, 10),
      pointer: faker.random.alpha({ count: 59, casing: "lower" }),
    },
    status: ["PENDING", "APPROVED", "REJECTED", "APPEAL", "FRAUD"][randomInt(0, 4)] as ProjectStatus,
    ...overrides
  }
)
