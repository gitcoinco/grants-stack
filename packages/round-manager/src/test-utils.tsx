import { faker } from "@faker-js/faker";
import { render } from "@testing-library/react";
import { randomInt } from "crypto";
import { BigNumber, ethers } from "ethers";
import { formatBytes32String, parseEther } from "ethers/lib/utils";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import {
  BulkUpdateGrantApplicationContext,
  BulkUpdateGrantApplicationState,
  initialBulkUpdateGrantApplicationState,
} from "./context/application/BulkUpdateGrantApplicationContext";
import {
  ReadProgramContext,
  ReadProgramState,
  initialReadProgramState,
} from "./context/program/ReadProgramContext";
import {
  FinalizeRoundContext,
  FinalizeRoundState,
  initialFinalizeRoundState,
} from "./context/round/FinalizeRoundContext";
import {
  RoundContext,
  RoundState,
  initialRoundState,
} from "./context/round/RoundContext";
import {
  ApplicationStatus,
  ApprovedProject,
  GrantApplication,
  Program,
  ProjectCredentials,
  ProjectMetadata,
  ProjectStatus,
  Round,
} from "./features/api/types";
import { IAM_SERVER } from "./features/round/ViewApplicationPage";
import moment from "moment";
import {
  ROUND_PAYOUT_DIRECT_OLD as ROUND_PAYOUT_DIRECT,
  ROUND_PAYOUT_MERKLE_OLD as ROUND_PAYOUT_MERKLE,
} from "common";
import { zeroAddress } from "viem";
import { DistributionMatch } from "data-layer";

export const mockedOperatorWallet = faker.finance.ethereumAddress();

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
  operatorWallets: [mockedOperatorWallet],
  ...overrides,
});

export const makeRoundData = (overrides: Partial<Round> = {}): Round => {
  const applicationsStartTime = faker.date.soon();
  const applicationsEndTime = faker.date.soon(10, applicationsStartTime);
  const roundStartTime = faker.date.future(1, applicationsEndTime);
  const roundEndTime = faker.date.soon(21, roundStartTime);
  const roundFeePercentage = 10000;
  const protocolFeePercentage = 10000;
  return {
    id: faker.finance.ethereumAddress(),
    chainId: 1,
    roundMetadata: {
      name: faker.company.name(),
      programContractAddress: faker.finance.ethereumAddress(),
      roundType: "private",
      eligibility: {
        description: faker.lorem.sentence(),
        requirements: [
          {
            requirement: "",
          },
        ],
      },
      quadraticFundingConfig: {
        matchingCap: true,
        matchingCapAmount: 100,
        matchingFundsAvailable: 1000,
        minDonationThreshold: true,
        minDonationThresholdAmount: 1,
        sybilDefense: false,
      },
    },
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
    token: ethers.constants.AddressZero, // to match our token list
    votingStrategy: faker.finance.ethereumAddress(),
    payoutStrategy: {
      id: faker.finance.ethereumAddress(),
      isReadyForPayout: false,
      strategyName: ROUND_PAYOUT_MERKLE,
    },
    protocolFeePercentage,
    roundFeePercentage,
    ownedBy: faker.finance.ethereumAddress(),
    operatorWallets: [mockedOperatorWallet],
    finalized: false,
    tags: ["allo-v1"],
    matchAmount: 0n,
    matchAmountInUsd: 0,
    fundedAmount: 0n,
    fundedAmountInUsd: 0,
    matchingDistribution: null,
    readyForPayoutTransaction: null,
    ...overrides,
  };
};

export const makeDirectGrantRoundData = (
  overrides: Partial<Round> = {}
): Round => {
  const applicationsStartTime = faker.date.soon();
  const applicationsEndTime = faker.date.soon(10, applicationsStartTime);
  const roundStartTime = faker.date.future(1, applicationsEndTime);
  const roundEndTime = faker.date.soon(21, roundStartTime);
  const roundFeePercentage = 10000;
  const protocolFeePercentage = 10000;
  return {
    id: faker.finance.ethereumAddress(),
    chainId: 1,
    roundMetadata: {
      name: faker.company.name(),
      programContractAddress: faker.finance.ethereumAddress(),
      roundType: "private",
      eligibility: {
        description: faker.lorem.sentence(),
        requirements: [
          {
            requirement: "",
          },
        ],
      },
      quadraticFundingConfig: {
        matchingCap: true,
        matchingCapAmount: 100,
        matchingFundsAvailable: 1000,
        minDonationThreshold: true,
        minDonationThresholdAmount: 1,
        sybilDefense: false,
      },
    },
    applicationsStartTime,
    applicationsEndTime,
    roundStartTime,
    roundEndTime,
    token: ethers.constants.AddressZero, // to match our token list
    votingStrategy: faker.finance.ethereumAddress(),
    payoutStrategy: {
      id: faker.finance.ethereumAddress(),
      isReadyForPayout: false,
      strategyName: ROUND_PAYOUT_DIRECT,
    },
    protocolFeePercentage,
    roundFeePercentage,
    ownedBy: faker.finance.ethereumAddress(),
    operatorWallets: [mockedOperatorWallet],
    finalized: false,
    matchAmount: 0n,
    matchAmountInUsd: 0,
    fundedAmount: 0n,
    fundedAmountInUsd: 0,
    matchingDistribution: null,
    readyForPayoutTransaction: null,
    ...overrides,
  };
};

export const makeMatchingStatsData = (): DistributionMatch => {
  return {
    projectName: faker.company.name(),
    applicationId: faker.datatype.number().toString(),
    projectId: formatBytes32String(faker.company.name().slice(0, 31)),
    contributionsCount: faker.datatype.number(),
    matchPoolPercentage: faker.datatype.number(),
    matchAmountInToken: faker.datatype.number().toString(),
    originalMatchAmountInToken: faker.datatype.number().toString(),
    projectPayoutAddress: faker.finance.ethereumAddress(),
    anchorAddress: faker.finance.ethereumAddress(),
  };
};

export const makeApplication = (): GrantApplication => {
  return {
    id: faker.finance.ethereumAddress(),
    round: faker.finance.ethereumAddress(),
    recipient: faker.finance.ethereumAddress(),
    projectsMetaPtr: {
      protocol: randomInt(1, 10),
      pointer: faker.random.alpha({ count: 59, casing: "lower" }),
    },
    status: ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "APPEAL", "FRAUD"][
      randomInt(0, 5)
    ] as ProjectStatus,
    applicationIndex: faker.datatype.number(),
    createdAt: faker.date.past().toDateString(),
    anchorAddress: faker.finance.ethereumAddress(),
    distributionTransaction: null,
  };
};

export type QFDistribution = {
  projectId: string;
  matchAmountInUSD: number;
  totalContributionsInUSD: number;
  matchPoolPercentage: number;
  matchAmountInToken: BigNumber;
  projectPayoutAddress: string;
  uniqueContributorsCount: number;
  revisedMatch: bigint;
  contributionsCount: number;
  matched: bigint;
  revisedContributionCount: number;
};
export const makeQFDistribution = (): QFDistribution => {
  return {
    projectId: faker.finance.ethereumAddress().toString(),
    matchAmountInUSD: faker.datatype.number(),
    totalContributionsInUSD: faker.datatype.number(),
    matchPoolPercentage: faker.datatype.number(),
    matchAmountInToken: parseEther(faker.datatype.number().toString()),
    projectPayoutAddress: faker.finance.ethereumAddress(),
    uniqueContributorsCount: faker.datatype.number(),
    revisedMatch: BigInt(1),
    contributionsCount: faker.datatype.number(),
    matched: BigInt(1),
    revisedContributionCount: faker.datatype.number(),
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
  payoutStrategy?: GrantApplication["payoutStrategy"];
  statusSnapshots?: GrantApplication["statusSnapshots"];
  inReview?: boolean;
  status?: GrantApplication["status"];
  applicationIndex?: GrantApplication["applicationIndex"];
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
    payoutStrategy,
    statusSnapshots,
    status,
    inReview,
    applicationIndex,
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

    payoutStrategy: payoutStrategy ?? {
      strategyName: ROUND_PAYOUT_MERKLE,
      id: zeroAddress,
      payouts: [],
    },

    statusSnapshots: statusSnapshots ?? [
      {
        status: "PENDING",
        updatedAt: moment().subtract(1, "days").toDate(),
      },
    ],

    recipient: faker.finance.ethereumAddress(),
    distributionTransaction: null,
    inReview: inReview ?? false,
    project: {
      lastUpdated: 1659714564,
      createdAt: 1659714564,
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
      projectGithub: projectGithubOverride ?? undefined,
      projectTwitter: projectTwitterOverride ?? undefined,
      credentials: makeProjectCredentials(credentialInputData, ownerAddress),
    },
    answers: applicationAnswers ?? [],
    projectsMetaPtr: {
      protocol: randomInt(1, 10),
      pointer: faker.random.alpha({ count: 59, casing: "lower" }),
    },
    projectId: "0x" + faker.random.alphaNumeric(40).toLowerCase(),
    status:
      status ??
      (["PENDING", "APPROVED", "REJECTED", "CANCELLED", "APPEAL", "FRAUD"][
        randomInt(0, 4)
      ] as ProjectStatus),
    applicationIndex: applicationIndex ?? faker.datatype.number(),
    anchorAddress: faker.finance.ethereumAddress(),
    createdAt: faker.datatype.number().toString(),
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
  render(<MemoryRouter>{ui}</MemoryRouter>);
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

export const wrapWithFinalizeRoundContext = (
  ui: JSX.Element,
  finalizeRoundStateOverrides: Partial<FinalizeRoundState> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any = jest.fn()
) => {
  return (
    <FinalizeRoundContext.Provider
      value={{
        state: { ...initialFinalizeRoundState, ...finalizeRoundStateOverrides },
        dispatch,
      }}
    >
      {ui}
    </FinalizeRoundContext.Provider>
  );
};

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
