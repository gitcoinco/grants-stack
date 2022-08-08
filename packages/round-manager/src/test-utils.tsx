import { render, render as rtlRender } from "@testing-library/react"
import { Provider } from "react-redux"
import React from "react"
import { api } from "./features/api"
import { configureStore } from "@reduxjs/toolkit"
import history from "./history"
import { ReduxRouter } from "@lagunovsky/redux-react-router"
import { GrantApplication, Program, Round } from "./features/api/types"
import { faker } from '@faker-js/faker';
import { randomInt } from "crypto"
import { store } from "./app/store";

// @ts-ignore
function reducer(ui, {
  // @ts-ignore
  preloadedState,
  store = configureStore({ reducer: { api: api.reducer }, preloadedState }),
  ...renderOptions
} = {}) {
  // @ts-ignore
  function Wrapper({ children }) {
    return (
      <Provider store={ store }>
        <ReduxRouter history={ history } store={ store }>
          { children }
        </ReduxRouter>
      </Provider>
    )
  }

  return rtlRender(ui ,{ wrapper: Wrapper, ...renderOptions })
}

export const makeStubProgram = (overrides: Partial<Program> = {}): Program => ({
  id: faker.finance.ethereumAddress(),
  metadata: {
    name: faker.company.bsBuzz()
  },
  store: {
    protocol: randomInt(1, 10),
    pointer: faker.random.alpha({count: 59, casing: "lower"})
  },
  operatorWallets: [
    faker.finance.ethereumAddress()
  ],
  ...overrides
})

export const makeStubRound = (overrides: Partial<Round> = {}): Round => {
  const applicationsStartTime = faker.date.soon();
  const applicationsEndTime = faker.date.soon(10, applicationsStartTime);
  const roundStartTime = faker.date.future(1, applicationsEndTime);
  const roundEndTime = faker.date.soon(21, roundStartTime);
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

export const makeStubApplication = (overrides: Partial<GrantApplication> = {}): GrantApplication => {
  return {
    id: faker.datatype.uuid(),
    round: faker.finance.ethereumAddress(),
    recipient: faker.finance.ethereumAddress(),
    project: {
      id: faker.datatype.uuid(),
      website: faker.internet.url(),
      logoImg: faker.image.imageUrl(),
      metaPtr: {
        protocol: faker.datatype.number(),
        pointer: faker.finance.ethereumAddress()
      },
      title: faker.name.middleName(),
      description: faker.name.jobDescriptor(),
      lastUpdated: faker.date.recent(5).getTime(),
    },
    answers: [],
    projectsMetaPtr: {
      protocol: faker.datatype.number(),
      pointer: faker.datatype.uuid()
    },
    ...overrides
  }
}

export const renderWrapped = (ui: JSX.Element) => {
  render(
    <Provider store={ store }>
      <ReduxRouter store={ store } history={ history }>
        { ui }
      </ReduxRouter>
    </Provider>
  )
}