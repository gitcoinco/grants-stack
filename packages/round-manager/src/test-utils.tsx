import React from "react"
import { GrantApplication, Program, ProjectStatus, Round } from "./features/api/types"
import { randomInt } from "crypto"
import { faker } from "@faker-js/faker"
import { render } from "@testing-library/react"
import { ReduxRouter } from "@lagunovsky/redux-react-router"
import { Provider } from "react-redux"
import { store } from "./app/store"
import history from "./history"

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

export const makeRoundData = (overrides: Partial<Round> = {}): Round => {
  const applicationsStartTime = faker.date.soon()
  const applicationsEndTime = faker.date.soon(10, applicationsStartTime)
  const roundStartTime = faker.date.future(1, applicationsEndTime)
  const roundEndTime = faker.date.soon(21, roundStartTime)
  return {
    id: faker.finance.ethereumAddress(),
    roundMetadata: {
      name: faker.company.companyName(),
    },
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
    token: faker.finance.ethereumAddress(),
    votingStrategy: faker.finance.ethereumAddress(),
    ownedBy: faker.finance.ethereumAddress(),
    ...overrides
  }
}

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

export const renderWrapped = (ui: JSX.Element) => {
  render(
    <Provider store={ store }>
      <ReduxRouter store={ store } history={ history }>
        { ui }
      </ReduxRouter>
    </Provider>
  )
}
