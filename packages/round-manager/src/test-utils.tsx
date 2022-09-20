import {
  AnswerBlock,
  GrantApplication,
  Program,
  ProjectCredentials,
  ProjectStatus,
  Round,
} from "./features/api/types";
import { randomInt } from "crypto";
import { faker } from "@faker-js/faker";
import { render } from "@testing-library/react";
import { ReduxRouter } from "@lagunovsky/redux-react-router";
import { Provider } from "react-redux";
import { store } from "./app/store";
import history from "./history";
import { IAM_SERVER } from "./features/round/ViewApplicationPage";
import {
  initialProgramState,
  ProgramContext,
  ProgramState,
} from "./context/ProgramContext";
import { MemoryRouter } from "react-router-dom";

export const makeProgramData = (overrides: Partial<Program> = {}): Program => ({
  id: faker.finance.ethereumAddress(),
  metadata: {
    name: faker.company.bsBuzz(),
  },
  // TODO add this back in for createProgram
  // store: {
  //   protocol: randomInt(1, 10),
  //   pointer: faker.random.alpha({ count: 59, casing: "lower" })
  // },
  operatorWallets: [faker.finance.ethereumAddress()],
  ...overrides,
});

export const makeRoundData = (overrides: Partial<Round> = {}): Round => {
  const applicationsStartTime = faker.date.soon();
  const applicationsEndTime = faker.date.soon(10, applicationsStartTime);
  const roundStartTime = faker.date.future(1, applicationsEndTime);
  const roundEndTime = faker.date.soon(21, roundStartTime);
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
    operatorWallets: [faker.finance.ethereumAddress()],
    ...overrides,
  };
};

export type ApplicationAndCredentialRelatedData = {
  credentialsProviderKey: string;
  credentialSubjectProviderString: string;
  grantApplicationProviderAnswer: {
    question: string;
    answer: string;
  };
};

export const makeApplicationAndCredentialRelatedDataForGithub = (
  githubOrgName = "gitcoinco"
): ApplicationAndCredentialRelatedData => ({
  credentialsProviderKey: "github",
  credentialSubjectProviderString: `ClearTextGithubOrg#${githubOrgName}#6887938`,
  grantApplicationProviderAnswer: {
    question: "Github Organization",
    answer: `${githubOrgName}`,
  },
});

export const makeApplicationAndCredentialRelatedDataForTwitter = (
  twitterHandle = "twitter"
): ApplicationAndCredentialRelatedData => ({
  credentialsProviderKey: "twitter",
  credentialSubjectProviderString: `ClearTextTwitter#${twitterHandle}`,
  grantApplicationProviderAnswer: {
    question: "Twitter",
    answer: `${twitterHandle}`,
  },
});

export const makeGrantApplicationData = (
  credentialProviderAndAnswersTestData: ApplicationAndCredentialRelatedData[] = [],
  ownerAddress: string = faker.finance.ethereumAddress()
): GrantApplication => {
  return {
    id: faker.random.alpha({ count: 10, casing: "lower" }),
    round: faker.random.alpha({ count: 59, casing: "lower" }),
    recipient: faker.finance.ethereumAddress(),
    project: {
      lastUpdated: 1659714564,
      id: faker.random.alpha({ count: 10, casing: "lower" }),
      owners: [
        {
          address: ownerAddress,
        },
      ],
      title: faker.lorem.sentence(2),
      description: faker.lorem.sentence(10),
      website: faker.internet.domainName(),
      bannerImg: faker.random.alpha({ count: 59, casing: "lower" }),
      logoImg: faker.random.alpha({ count: 59, casing: "lower" }),
      metaPtr: {
        protocol: randomInt(1, 10),
        pointer: faker.random.alpha({ count: 59, casing: "lower" }),
      },
      credentials: makeProjectCredentialsFromTestData(
        credentialProviderAndAnswersTestData,
        ownerAddress
      ),
    },
    answers: makeAnswersFromTestData(credentialProviderAndAnswersTestData),
    projectsMetaPtr: {
      protocol: randomInt(1, 10),
      pointer: faker.random.alpha({ count: 59, casing: "lower" }),
    },
    status: ["PENDING", "APPROVED", "REJECTED", "APPEAL", "FRAUD"][
      randomInt(0, 4)
    ] as ProjectStatus,
  };
};

export const makeProjectCredentialsFromTestData = (
  credentialProviderAndAnswersTestData: ApplicationAndCredentialRelatedData[],
  credentialSubjectAddress: string = faker.finance.ethereumAddress()
): ProjectCredentials => {
  return credentialProviderAndAnswersTestData.reduce(
    (
      aggregator: ProjectCredentials,
      it: ApplicationAndCredentialRelatedData
    ) => {
      aggregator[it.credentialsProviderKey] = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential"],
        credentialSubject: {
          id: `did:pkh:eip155:1:${credentialSubjectAddress}`,
          "@context": [],
          provider: it.credentialSubjectProviderString,
        },
        issuer: `${IAM_SERVER}`,
        issuanceDate: "2022-08-10T16:09:56.284Z",
        proof: {
          type: "Ed25519Signature2018",
          proofPurpose: "assertionMethod",
          verificationMethod:
            "did:key:z6Mks2YNwbkzDgKLuQs1TS3whP9RdXrGXtVqt5JcCLoQu86W#z6Mks2YNwbkzDgKLuQs1TS3whP9RdXrGXtVqt5JcCLoQu86W",
          created: "2022-08-10T16:09:56.285Z",
          jws: "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..DpYFl50koEsj_XGa2rK9AlYny8Uvn3UZ-sCC6a0AW06TCSNmS19_5Y5TExqQtJZWAYlWFAWsuAwNiwhVFY-oDw",
        },
        expirationDate: "2022-11-08T17:09:56.284Z",
      };
      return aggregator;
    },
    {}
  );
};

export const makeAnswersFromTestData = (
  credentialProviderAndAnswersTestData: ApplicationAndCredentialRelatedData[]
): AnswerBlock[] =>
  credentialProviderAndAnswersTestData.map((it, index) => ({
    ...it.grantApplicationProviderAnswer,
    questionId: index,
  }));

export const renderWrapped = (ui: JSX.Element) => {
  render(
    <Provider store={store}>
      <ReduxRouter store={store} history={history}>
        {ui}
      </ReduxRouter>
    </Provider>
  );
};

// TODO finish and replace other renderWrapped function
export const renderWithContext = (
  ui: JSX.Element,
  programStateOverrides: Partial<ProgramState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <ProgramContext.Provider
        value={{
          state: { ...initialProgramState, ...programStateOverrides },
          dispatch,
        }}
      >
        {ui}
      </ProgramContext.Provider>
    </MemoryRouter>
  );
