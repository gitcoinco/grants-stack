import {
  ApplicationStatus,
  ApprovedProject,
  GrantApplication,
  MatchingStatsData,
  Program,
  ProjectCredentials,
  ProjectMetadata,
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
  initialReadProgramState,
  ReadProgramContext,
  ReadProgramState,
} from "./context/program/ReadProgramContext";
import { MemoryRouter } from "react-router-dom";
import {
  initialRoundState,
  RoundContext,
  RoundState,
} from "./context/round/RoundContext";
import {
  ApplicationContext,
  ApplicationState,
  initialApplicationState,
} from "./context/application/ApplicationContext";
import {
  BulkUpdateGrantApplicationContext,
  BulkUpdateGrantApplicationState,
  initialBulkUpdateGrantApplicationState,
} from "./context/application/BulkUpdateGrantApplicationContext";
import React from "react";
import { QFDistribution } from "./features/api/api";

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
      programContractAddress: faker.finance.ethereumAddress(),
      matchingFunds: {
        matchingCap: true,
        matchingCapAmount: 100,
        matchingFundsAvailable: 1000,
      },
      voting: "QFVoting",
    },
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
    token: faker.finance.ethereumAddress(),
    votingStrategy: faker.finance.ethereumAddress(),
    payoutStrategy: faker.finance.ethereumAddress(),
    ownedBy: faker.finance.ethereumAddress(),
    operatorWallets: [faker.finance.ethereumAddress()],
    ...overrides,
  };
};

export const makeMatchingStatsData = (): MatchingStatsData => {
  return {
    projectName: faker.company.name(),
    projectId: faker.finance.ethereumAddress().toString(),
    uniqueContributorsCount: faker.datatype.number(),
    matchPoolPercentage: faker.datatype.number(),
  };
};

export const makeQFDistribution = (): QFDistribution => {
  return {
    projectId: faker.finance.ethereumAddress().toString(),
    matchAmountInUSD: faker.datatype.number(),
    totalContributionsInUSD: faker.datatype.number(),
    matchPoolPercentage: faker.datatype.number(),
    matchAmountInToken: faker.datatype.number(),
    projectPayoutAddress: faker.finance.ethereumAddress(),
    uniqueContributorsCount: faker.datatype.number(),
  };
};

export const makeApprovedProjectData = (
  overrides?: Partial<ApprovedProject>,
  projectMetadataOverrides?: Partial<ProjectMetadata>
): ApprovedProject => {
  return {
    grantApplicationId: `${faker.finance.ethereumAddress()}-${faker.finance.ethereumAddress()}`,
    projectRegistryId: faker.datatype.number().toString(),
    recipient: faker.finance.ethereumAddress(),
    projectMetadata: {
      title: faker.company.name(),
      description: faker.lorem.sentence(),
      website: faker.internet.url(),
      projectTwitter: faker.internet.userName(),
      projectGithub: faker.internet.userName(),
      userGithub: faker.internet.userName(),
      owners: [{ address: faker.finance.ethereumAddress() }],
      ...projectMetadataOverrides,
    },
    status: ApplicationStatus.APPROVED,
    ...overrides,
  };
};

type ApplicationCredentialData = {
  credentialsProviderKey: string;
  credentialSubjectProviderString: string;
};

export interface MakeGrantApplicationDataParams {
  ownerAddress?: string;
  applicationIdOverride?: string;
  roundIdOverride?: string;
  projectGithubOverride?: string;
  projectTwitterOverride?: string;
  applicationAnswers?: GrantApplication["answers"];
}

export const makeGrantApplicationData = (
  overrides?: MakeGrantApplicationDataParams
): GrantApplication => {
  const {
    ownerAddress,
    applicationIdOverride,
    roundIdOverride,
    projectGithubOverride,
    projectTwitterOverride,
    applicationAnswers,
  } = {
    ownerAddress: faker.finance.ethereumAddress(),
    ...overrides,
  };

  const credentialInputData: ApplicationCredentialData[] = [];
  if (projectGithubOverride) {
    credentialInputData.push({
      credentialsProviderKey: "github",
      credentialSubjectProviderString: `ClearTextGithubOrg#${projectGithubOverride}#6887938`,
    });
  }
  if (projectTwitterOverride) {
    credentialInputData.push({
      credentialsProviderKey: "twitter",
      credentialSubjectProviderString: `ClearTextTwitter#${projectTwitterOverride}`,
    });
  }

  return {
    id:
      applicationIdOverride ||
      faker.random.alpha({ count: 10, casing: "lower" }),
    round:
      roundIdOverride || faker.random.alpha({ count: 59, casing: "lower" }),
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
      projectGithub: projectGithubOverride ?? undefined,
      projectTwitter: projectTwitterOverride ?? undefined,
      credentials: makeProjectCredentials(credentialInputData, ownerAddress),
    },
    answers: applicationAnswers ?? [],
    projectsMetaPtr: {
      protocol: randomInt(1, 10),
      pointer: faker.random.alpha({ count: 59, casing: "lower" }),
    },
    status: ["PENDING", "APPROVED", "REJECTED", "APPEAL", "FRAUD"][
      randomInt(0, 4)
    ] as ProjectStatus,
  };
};

export const makeProjectCredentials = (
  credentialTypesToGenerate: ApplicationCredentialData[],
  credentialSubjectAddress: string = faker.finance.ethereumAddress()
): ProjectCredentials => {
  return credentialTypesToGenerate.reduce(
    (aggregator: ProjectCredentials, it: ApplicationCredentialData) => {
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

export const renderWrapped = (ui: JSX.Element) => {
  render(
    <Provider store={store}>
      <ReduxRouter store={store} history={history}>
        {ui}
      </ReduxRouter>
    </Provider>
  );
};

// TODO finish and replace other renderWrapped function @vacekj
export const renderWithProgramContext = (
  ui: JSX.Element,
  programStateOverrides: Partial<ReadProgramState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <ReadProgramContext.Provider
        value={{
          state: { ...initialReadProgramState, ...programStateOverrides },
          dispatch,
        }}
      >
        {ui}
      </ReadProgramContext.Provider>
    </MemoryRouter>
  );

export const renderWithApplicationContext = (
  ui: JSX.Element,
  grantApplicationStateOverrides: Partial<ApplicationState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) =>
  render(
    <MemoryRouter>
      <ApplicationContext.Provider
        value={{
          state: {
            ...initialApplicationState,
            ...grantApplicationStateOverrides,
          },
          dispatch,
        }}
      >
        {ui}
      </ApplicationContext.Provider>
    </MemoryRouter>
  );

export const wrapWithApplicationContext = (
  ui: JSX.Element,
  grantApplicationStateOverrides: Partial<ApplicationState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) => (
  <ApplicationContext.Provider
    value={{
      state: {
        ...initialApplicationState,
        ...grantApplicationStateOverrides,
      },
      dispatch,
    }}
  >
    {ui}
  </ApplicationContext.Provider>
);

export const wrapWithReadProgramContext = (
  ui: JSX.Element,
  programStateOverrides: Partial<ReadProgramState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) => (
  <MemoryRouter>
    <ReadProgramContext.Provider
      value={{
        state: { ...initialReadProgramState, ...programStateOverrides },
        dispatch,
      }}
    >
      {ui}
    </ReadProgramContext.Provider>
  </MemoryRouter>
);

export const wrapWithRoundContext = (
  ui: JSX.Element,
  roundStateOverrides: Partial<RoundState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) => (
  <RoundContext.Provider
    value={{
      state: { ...initialRoundState, ...roundStateOverrides },
      dispatch,
    }}
  >
    {ui}
  </RoundContext.Provider>
);

export const wrapWithBulkUpdateGrantApplicationContext = (
  ui: JSX.Element,
  bulkUpdateOverrides: Partial<BulkUpdateGrantApplicationState> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => (
  <BulkUpdateGrantApplicationContext.Provider
    value={{
      ...initialBulkUpdateGrantApplicationState,
      ...bulkUpdateOverrides,
    }}
  >
    {ui}
  </BulkUpdateGrantApplicationContext.Provider>
);

type ContextMock<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: React.Context<any>;
  value: T;
};

/**
 * Wraps the element in an arbitrary amount of contexts for testing purposes
 * @param element the final child element. Can be a React component, an HTML tag, or even a string, null. etc. See ReactElement type
 * @param contexts the contexts to wrap the element with, including their values
 */
export function wrapInContexts<T>(
  element: React.ReactNode,
  contexts: ContextMock<T>[]
) {
  return (
    <>
      {contexts.reduceRight((acc, { context, value }) => {
        return <context.Provider value={value}>{acc}</context.Provider>;
      }, element)}
    </>
  );
}
