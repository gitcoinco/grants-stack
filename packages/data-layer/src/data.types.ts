import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { Address } from "viem";
import { RoundApplicationMetadata } from "./roundApplication.types";
export type RoundPayoutType =
  | "allov1.Direct"
  | "allov1.QF"
  | "allov2.DirectGrantsSimpleStrategy"
  | "allov2.DirectGrantsLiteStrategy"
  | "allov2.DonationVotingMerkleDistributionDirectTransferStrategy"
  | "allov2.DirectAllocationStrategy"
  | ""; // This is to handle the cases where the strategyName is not set in a round, mostly spam rounds
export type RoundVisibilityType = "public" | "private";

// Note: this also exists in `common` and not able to import from there due to circular dependency.
export enum RoundCategory {
  QuadraticFunding,
  Direct,
}

export type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "IN_REVIEW"
  | "REJECTED"
  | "APPEAL"
  | "FRAUD"
  | "RECEIVED"
  | "CANCELLED"
  | "IN_REVIEW";

export type ProjectType = "CANONICAL" | "LINKED";

export type GrantApplicationFormAnswer = {
  questionId: number;
  question: string;
  answer: string | string[];
  hidden: boolean;
  type?: string;
};

export type ProjectCredentials = {
  [key: string]: VerifiableCredential;
};

export interface ProjectOwner {
  address: string;
}

export type ProjectMetadata = {
  title: string;
  description: string;
  website: string;
  bannerImg?: string;
  logoImg?: string;
  projectTwitter?: string;
  userGithub?: string;
  projectGithub?: string;
  credentials: ProjectCredentials;
  owners: ProjectOwner[];
  createdAt: number;
  lastUpdated: number;
};

export type ProgramMetadata = {
  name: string;
  type: string;
};

export type AddressAndRole = {
  address: string;
  role: string;
  createdAtBlock: string;
  // updatedAtBlock: string;
};

/**
 * The project type for v1
 *
 * @remarks
 *
 * This is more of the Application snapshot of the project at the time of the application.
 *
 * @deprecated - This type is deprecated and should not be used for new projects.
 */
export type Project = {
  grantApplicationId: string;
  projectRegistryId: string;
  anchorAddress?: string;
  recipient: string;
  projectMetadata: ProjectMetadata;
  grantApplicationFormAnswers: GrantApplicationFormAnswer[];
  status: ApplicationStatus;
  applicationIndex: number;
};

/**
 * The project role type for v2
 *
 * @remarks
 *
 * This is the type for v2 project roles which get created on Allo as `Profiles`.
 *
 * @example
 *
 * ```ts
 * const projectRole: ProjectRole = {
 *  project: {
 *   chainId: 1,
 *   createdAtBlock: 1,
 *   registryAddress: "0x123",
 *   projectNumber: 1,
 *   tags: ["allo-v2"],
 *  },
 *   projectId: "0x123",
 * };
 *
 * ```
 */
export type ProjectRole = {
  project: {
    chainId: number;
    createdAtBlock: number;
    registryAddress: string;
    projectNumber: number;
    tags: string[];
  };
  projectId: string;
};

/**
 * The project type for v2
 *
 * @remarks
 *
 * This is the type for v2 projects which get created on Allo as `Profiles`.
 *
 */
export type v2Project = {
  /**
   * The on-chain unique project ID - `bytes32` string.
   */
  id: string;
  /**
   * The chain ID of the network
   */
  chainId: number;
  /**
   * The metadata of the project
   */
  metadata: {
    protocol: number;
    pointer: string;
    id: string;
    title: string;
    description: string;
    logoImg?: string;
    website: string;
    bannerImg?: string;
    logoImgData?: Blob;
    bannerImgData?: Blob;
    userGithub?: string;
    projectGithub?: string;
    projectTwitter?: string;
    credentials?: ProjectCredentials;
    createdAt?: number;
    updatedAt?: number;
  };
  /**
   * The metadata CID of the project
   */
  metadataCid: string;
  name: string;
  nodeId: string;
  /**
   * The project number from v1
   *
   * @deprecated - This is deprecated and will return `null` for v2 projects.
   */
  projectNumber: number | null;
  /**
   * The registry address of the project
   */
  registryAddress: string;
  /**
   * The tags of the project
   *
   * @remarks
   *
   * The tags are used to filter the projects based on the version of Allo.
   */
  tags: ("allo-v1" | "allo-v2" | "program")[];
  /**
   * Address which created the project
   */
  createdByAddress: string;
  /**
   * The block the project was created at
   */
  createdAtBlock: string;
  /**
   * The block the project was updated at
   */
  updatedAtBlock: string;
  roles: AddressAndRole[];
  nonce?: bigint;
  anchorAddress?: string;
  /**
   * The type of the project - `CANONICAL` or `LINKED`
   */
  projectType: ProjectType;
  /**
   * The linked chains to the canonical project
   */
  linkedChains?: number[];
  qfRounds?: string[];
  dgRounds?: string[];
};

/**
 * The program type for v1
 **/

export type Program = Omit<v2Project, "metadata"> & {
  metadata: {
    name: string;
  };
};

export type ProjectApplicationMetadata = {
  signature: string;
  application: {
    round: string;
    answers: {
      type: string;
      hidden: boolean;
      question: string;
      questionId: number;
      encryptedAnswer?: {
        ciphertext: string;
        encryptedSymmetricKey: string;
      };
    }[];
    project: ProjectMetadata;
    recipient: string;
  };
};

/**
 * The round type with applications for v1
 **/

export type RoundWithApplications = Omit<RoundGetRound, "applications"> & {
  applications: Application[];
};

export type RoundForExplorer = Omit<RoundGetRound, "applications"> & {
  applications: (Application & { anchorAddress: Address })[];
  uniqueDonorsCount?: number;
};

export type BaseDonorValues = {
  totalAmountDonatedInUsd: number;
  totalDonationsCount: number;
  uniqueDonorsCount: number;
};

/**
 * The project application type for v2
 *
 */
export type ProjectApplication = {
  id: string;
  projectId: string;
  chainId: number;
  roundId: string;
  status: ApplicationStatus;
  metadataCid: string;
  metadata: ProjectApplicationMetadata;
  distributionTransaction: string | null;
} & BaseDonorValues;

export type ProjectApplicationForManager = ProjectApplication & {
  anchorAddress: Address;
  statusSnapshots: {
    status: ApplicationStatus;
    updatedAtBlock: string;
    updatedAt: string;
  }[];
  round: {
    strategyName: string;
    strategyAddress: string;
  };
  canonicalProject: {
    roles: { address: Address }[];
  };
};

export type ProjectApplicationWithRound = ProjectApplication & {
  anchorAddress: Address;
  round: {
    applicationsStartTime: string;
    applicationsEndTime: string;
    donationsStartTime: string;
    donationsEndTime: string;
    roundMetadata: RoundMetadata;
    name: string;
    strategyName: RoundPayoutType;
  };
};

export type ProjectApplicationWithRoundAndProgram = ProjectApplication & {
  anchorAddress: Address;
  round: {
    applicationsStartTime: string;
    applicationsEndTime: string;
    donationsStartTime: string;
    donationsEndTime: string;
    roundMetadata: RoundMetadata;
    project: {
      name: string;
    };
    strategyName: RoundPayoutType;
  };
};

/**
 * V2 Round
 */
export type V2Round = {
  id: string;
  chainId: number;
  applicationsStartTime: string;
  applicationsEndTime: string;
  donationsStartTime: string;
  donationsEndTime: string;
  matchTokenAddress: string;
  roundMetadata: RoundMetadata | null;
  roundMetadataCid: string;
  applicationMetadata: RoundApplicationMetadata | null;
  applicationMetadataCid: string;
  strategyId: string;
  projectId: string;
  strategyAddress: Address;
  strategyName: string;
  readyForPayoutTransaction: string | null;
  tags: string[];
};

/**
 * V2 Round with project
 */
export type V2RoundWithProject = V2RoundWithRoles & {
  project: {
    id: string;
    name: string;
    metadata: ProgramMetadata;
  };
};

export type DistributionMatch = {
  projectId: string;
  projectName: string;
  applicationId: string;
  anchorAddress: string;
  matchPoolPercentage: number;
  contributionsCount: number;
  matchAmountInToken: string;
  projectPayoutAddress: string;
  originalMatchAmountInToken: string;
};

export type RoundForManager = V2RoundWithProject & {
  matchingDistribution: {
    matchingDistribution: DistributionMatch[];
  } | null;
  tags: string[];
  matchAmount: string;
  matchAmountInUsd: number;
  fundedAmount: string;
  fundedAmountInUsd: number;
};

export type ProjectApplicationWithProject = {
  id: string;
  name: string;
};

export type V2RoundWithRoles = V2Round & {
  roles: AddressAndRole[];
  createdByAddress: string;
};

export type ProjectEvents = {
  createdAtBlock: number | undefined;
  updatedAtBlock: number | undefined;
};

export type ProjectEventsMap = {
  [projectID: string]: ProjectEvents;
};

export interface PayoutStrategy {
  id: string;
  /**
   * Whether is QUADRATIC FUNDING or DIRECT GRANT
   * MERKLE for QF
   * DIRECT for DG
   */
  strategyName: RoundPayoutType;
}

export interface MetadataPointer {
  /**
   * The decentralized storage protocol
   * Read more here: https://github.com/gitcoinco/grants-round/blob/main/packages/contracts/docs/MetaPtrProtocol.md
   */
  protocol: number;
  /**
   * The identifier which represents the program metadata on a decentralized storage
   */
  pointer: string;
}

export type Requirement = {
  // Requirement for the round
  requirement?: string;
};

export type Eligibility = {
  // Eligibility for the round
  description: string;
  // Requirements for the round
  requirements?: Requirement[];
};

export type SybilDefense = "passport" | "passport-mbds" | "none";

export interface Round {
  /**
   * The on-chain unique round ID
   */
  id?: string;
  /**
   * The chain ID of the network
   */
  chainId?: number;
  /**
   * Metadata of the Round to be stored off-chain
   */
  roundMetadata?: {
    name: string;
    roundType?: RoundVisibilityType;
    eligibility: Eligibility;
    programContractAddress: string;
    quadraticFundingConfig?: {
      matchingFundsAvailable: number;
      matchingCap: boolean;
      matchingCapAmount?: number;
      minDonationThreshold?: boolean;
      minDonationThresholdAmount?: number;
      sybilDefense?: SybilDefense | boolean; // this is to support both old and new sybil defense types.
    };
    support?: {
      type: string;
      info: string;
    };
  };
  /**
   * Pointer to round metadata in a decentralized storage e.g IPFS, Ceramic etc.
   */
  store?: MetadataPointer;
  /**
   * Pointer to application metadata in a decentralized storage e.g IPFS, Ceramic etc.
   */
  applicationStore?: MetadataPointer;
  /**
   * Helps identifying Round Types from QF and DG
   */
  payoutStrategy: PayoutStrategy;
  /**
   * Voting contract address
   */
  votingStrategy?: string;
  /**
   * Unix timestamp of the start of the round
   */
  roundStartTime: Date;
  /**
   * Unix timestamp of the end of the round
   */
  roundEndTime: Date;
  /**
   * Unix timestamp of when grants can apply to a round
   */
  applicationsStartTime: Date;
  /**
   * Unix timestamp after which grants cannot apply to a round
   */
  applicationsEndTime: Date;
  /**
   * Contract address of the token used to payout match amounts at the end of a round
   */
  token: string;

  /**
   * Contract address of the program to which the round belongs
   */
  ownedBy?: string;
  /**
   * Addresses of wallets that will have admin privileges to operate the Grant program
   */
  operatorWallets?: Array<string>;
  /**
   * List of projects approved for the round
   */
  approvedProjects?: Project[];
  uniqueDonorsCount?: number;
}

export type TimeFilter = {
  greaterThan?: string;
  lessThan?: string;
  greaterThanOrEqualTo?: string;
  lessThanOrEqualTo?: string;
  isNull?: boolean;
};

export type TimeFilterVariables = {
  applicationsStartTime?: TimeFilter;
  applicationsEndTime?: TimeFilter;
  donationsStartTime?: TimeFilter;
  donationsEndTime?: TimeFilter;
  or?: TimeFilterVariables[];
};

export type RoundsQueryVariables = {
  first?: number;
  orderBy?: OrderByRounds;
  filter?: {
    and: (
      | { or: TimeFilterVariables[] }
      | { or: { strategyName: { in: string[] } } }
      | {
          or: {
            chainId: {
              in: number[];
            };
          };
        }
      | {
          tags: {
            contains: "allo-v1" | "allo-v2";
          };
        }
    )[];
  };
};

export type RoundOverview = {
  id: string;
  chainId: number;
  createdAt: string;
  roundMetaPtr: MetadataPointer;
  applicationMetaPtr: MetadataPointer;
  applicationsStartTime: string;
  applicationsEndTime: string;
  roundStartTime: string;
  roundEndTime: string;
  matchAmount: string;
  token: string;
  roundMetadata?: RoundMetadata;
  projects?: { id: string }[];
  payoutStrategy: {
    id: string;
    strategyName: RoundPayoutType;
  };
};

/**
 * Shape of IPFS content of Round RoundMetaPtr
 */
export type RoundMetadata = {
  name: string;
  roundType: RoundVisibilityType;
  eligibility: Eligibility;
  programContractAddress: string;
  support?: {
    info: string;
    type: string;
  };
};

export type SearchBasedProjectCategory = {
  id: string;
  name: string;
  images: string[];
  searchQuery: string;
};

export type ExpandedApplicationRef = {
  chainId: number;
  roundId: string;
  id: string;
};

export type Collection = {
  id: string;
  author: string;
  name: string;
  images: string[];
  description: string;
  applicationRefs: string[];
};

export type RoundGetRound = {
  id: string;
  tags: string[];
  chainId: number;
  ownedBy?: string;
  createdAtBlock: number;
  roundMetadataCid: string;
  roundMetadata: RoundMetadataGetRound;
  applicationsStartTime: string;
  applicationsEndTime: string;
  donationsStartTime: string;
  donationsEndTime: string;
  matchAmountInUsd: number;
  matchAmount: string;
  matchTokenAddress: string;
  strategyId: string;
  strategyName: RoundPayoutType;
  strategyAddress: string;
  applications: ApplicationWithId[];
};

export interface RoundMetadataGetRound {
  name: string;
  support?: Support;
  eligibility: Eligibility;
  feesAddress?: string;
  matchingFunds?: MatchingFunds;
  feesPercentage?: number;
  programContractAddress: string;
  quadraticFundingConfig?: QuadraticFundingConfig;
  roundType?: RoundVisibilityType;
}

export interface Support {
  info: string;
  type: string;
}

export interface MatchingFunds {
  matchingCap: boolean;
  matchingFundsAvailable: number;
}

export interface QuadraticFundingConfig {
  matchingCap: boolean;
  sybilDefense: SybilDefense | boolean;
  matchingCapAmount?: number;
  minDonationThreshold: boolean;
  matchingFundsAvailable: number;
  minDonationThresholdAmount?: number;
}

export interface ApplicationWithId {
  id: string;
}

export type OrderByRounds =
  | "NATURAL"
  | "ID_ASC"
  | "ID_DESC"
  | "CHAIN_ID_ASC"
  | "CHAIN_ID_DESC"
  | "TAGS_ASC"
  | "TAGS_DESC"
  | "MATCH_AMOUNT_ASC"
  | "MATCH_AMOUNT_DESC"
  | "MATCH_TOKEN_ADDRESS_ASC"
  | "MATCH_TOKEN_ADDRESS_DESC"
  | "MATCH_AMOUNT_IN_USD_ASC"
  | "MATCH_AMOUNT_IN_USD_DESC"
  | "APPLICATION_METADATA_CID_ASC"
  | "APPLICATION_METADATA_CID_DESC"
  | "APPLICATION_METADATA_ASC"
  | "APPLICATION_METADATA_DESC"
  | "ROUND_METADATA_CID_ASC"
  | "ROUND_METADATA_CID_DESC"
  | "ROUND_METADATA_ASC"
  | "ROUND_METADATA_DESC"
  | "APPLICATIONS_START_TIME_ASC"
  | "APPLICATIONS_START_TIME_DESC"
  | "APPLICATIONS_END_TIME_ASC"
  | "APPLICATIONS_END_TIME_DESC"
  | "DONATIONS_START_TIME_ASC"
  | "DONATIONS_START_TIME_DESC"
  | "DONATIONS_END_TIME_ASC"
  | "DONATIONS_END_TIME_DESC"
  | "CREATED_AT_BLOCK_ASC"
  | "CREATED_AT_BLOCK_DESC"
  | "UPDATED_AT_BLOCK_ASC"
  | "UPDATED_AT_BLOCK_DESC"
  | "MANAGER_ROLE_ASC"
  | "MANAGER_ROLE_DESC"
  | "ADMIN_ROLE_ASC"
  | "ADMIN_ROLE_DESC"
  | "STRATEGY_ADDRESS_ASC"
  | "STRATEGY_ADDRESS_DESC"
  | "STRATEGY_ID_ASC"
  | "STRATEGY_ID_DESC"
  | "STRATEGY_NAME_ASC"
  | "STRATEGY_NAME_DESC"
  | "PROJECT_ID_ASC"
  | "PROJECT_ID_DESC"
  | "TOTAL_AMOUNT_DONATED_IN_USD_ASC"
  | "TOTAL_AMOUNT_DONATED_IN_USD_DESC"
  | "TOTAL_DONATIONS_COUNT_ASC"
  | "TOTAL_DONATIONS_COUNT_DESC"
  | "UNIQUE_DONORS_COUNT_ASC"
  | "UNIQUE_DONORS_COUNT_DESC"
  | "PRIMARY_KEY_ASC"
  | "PRIMARY_KEY_DESC";

export type Application = {
  id: string;
  chainId: string;
  roundId: string;
  projectId: string;
  status: ApplicationStatus;
  totalAmountDonatedInUsd: number;
  totalDonationsCount: string;
  uniqueDonorsCount: number;
  anchorAddress?: string;
  round: {
    strategyName: RoundPayoutType;
    donationsStartTime: string;
    donationsEndTime: string;
    applicationsStartTime: string;
    applicationsEndTime: string;
    roundMetadata: RoundMetadata;
    matchTokenAddress: string;
    tags: string[];
  };
  project: {
    id: string;
    metadata: ProjectMetadata;
    anchorAddress?: string;
  };
  metadata: {
    application: {
      recipient: string;
      answers: GrantApplicationFormAnswer[];
    };
  };
};

export type Contribution = {
  id: string;
  chainId: number;
  projectId: string;
  roundId: string;
  recipientAddress: string;
  applicationId: string;
  tokenAddress: string;
  donorAddress: string;
  amount: string;
  amountInUsd: number;
  transactionHash: string;
  blockNumber: number;
  round: {
    roundMetadata: RoundMetadata;
    donationsStartTime: string;
    donationsEndTime: string;
    strategyName: RoundPayoutType;
  };
  application: {
    project: {
      name: string;
    };
  };
  timestamp: string;
};

export type Payout = {
  id: string;
  tokenAddress: string;
  amount: string;
  amountInUsd: number;
  transactionHash: string;
  timestamp: string;
  sender: string;
};

export type RoundApplicationPayout = {
  id: string;
  applications: [
    {
      id: string;
      applicationsPayoutsByChainIdAndRoundIdAndApplicationId: Payout[];
    },
  ];
};
