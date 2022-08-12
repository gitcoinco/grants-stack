import React from "react"
import {GrantApplication, Program, ProjectCredentials, ProjectStatus, Round} from "./features/api/types"
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
      name: faker.company.name(),
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

export type VerifiableCredential = {
    "@context": string[];
    type: string[];
    credentialSubject: {
        id: string;
        "@context": { [key: string]: string }[];
        hash?: string;
        provider?: string;
        address?: string;
        challenge?: string;
    };
    issuer: string;
    issuanceDate: string;
    expirationDate: string;
    proof: {
        type: string;
        proofPurpose: string;
        verificationMethod: string;
        created: string;
        jws: string;
    };
};

export const makeGrantApplicationData = (overrides: Partial<GrantApplication> = {}, projectCredentials: ProjectCredentials = {}): GrantApplication => ({
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
      },
    credentials: projectCredentials,
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

//TODO: Change expirationDate to be future date
export const makeProjectCredentialData = (overrides: Partial<ProjectCredentials> = {}): ProjectCredentials => ({
    "github": {
        "@context": [
            "https://www.w3.org/2018/credentials/v1"
        ],
        "type": [
            "VerifiableCredential"
        ],
        "credentialSubject": {
            "id": "did:pkh:eip155:1:0x7A67063c391F266D31eA6c9eC7C788c1323B7746",
            "hash": "v0.0.0:kJUEWnuUKJQmxma4ov/QZjxL6ohzRGL5Fz9peShRgmw=",
            "@context": [
                {
                    "hash": "https://schema.org/Text",
                    "provider": "https://schema.org/Text"
                }
            ],
            "provider": "ClearTextGithubOrg#gitcoinco#6887938"
        },
        "issuer": "did:key:z6Mks2YNwbkzDgKLuQs1TS3whP9RdXrGXtVqt5JcCLoQu86W",
        "issuanceDate": "2022-08-10T16:09:56.284Z",
        "proof": {
            "type": "Ed25519Signature2018",
            "proofPurpose": "assertionMethod",
            "verificationMethod": "did:key:z6Mks2YNwbkzDgKLuQs1TS3whP9RdXrGXtVqt5JcCLoQu86W#z6Mks2YNwbkzDgKLuQs1TS3whP9RdXrGXtVqt5JcCLoQu86W",
            "created": "2022-08-10T16:09:56.285Z",
            "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..DpYFl50koEsj_XGa2rK9AlYny8Uvn3UZ-sCC6a0AW06TCSNmS19_5Y5TExqQtJZWAYlWFAWsuAwNiwhVFY-oDw"
        },
        "expirationDate": "2022-11-08T17:09:56.284Z"
    },
    ...overrides
});

export const renderWrapped = (ui: JSX.Element) => {
  render(
    <Provider store={ store }>
      <ReduxRouter store={ store } history={ history }>
        { ui }
      </ReduxRouter>
    </Provider>
  )
}
