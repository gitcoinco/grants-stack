import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { RoundApplicationMetadata } from "./roundApplication.types";
// TODO `RoundPayoutType` and `RoundVisibilityType` are duplicated from `common` to
// avoid further spaghetti dependencies. They should probably be relocated here.
export type RoundPayoutType =
  | "MERKLE"
  | "DIRECT"
  | "allov1.Direct"
  | "allov1.QF";
export type RoundVisibilityType = "public" | "private";

export type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "APPEAL"
  | "FRAUD"
  | "RECEIVED";

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
  credentials?: ProjectCredentials;
  owners: ProjectOwner[];
  createdAt?: number;
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
};

/**
 * The program type for v1
 **/

export type Program = Omit<v2Project, "metadata"> & {
  metadata: {
    name: string;
  };
};

/**
 * The project application type for v2
 *
 */
export type ProjectApplication = {
  id: string;
  chainId: number;
  roundId: string;
  status: ApplicationStatus;
  metadataCid: string;
  metadata: any; // TODO: fix
  inReview: boolean;
  round: {
    applicationsStartTime: string;
    applicationsEndTime: string;
    donationsStartTime: string;
    donationsEndTime: string;
    roundMetadata: RoundMetadata;
    name: string;
  };
};

/**
 * The round type for v2
 *
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
  strategyAddress: string;
  strategyName: string;
};

export type V2RoundWithRoles = V2Round & {
  roles: AddressAndRole[];
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

export interface Round {
  /**
   * The on-chain unique round ID
   */
  id?: string;
  /**
   * Metadata of the Round to be stored off-chain
   */
  roundMetadata?: {
    name: string;
    roundType: RoundVisibilityType;
    eligibility: Eligibility;
    programContractAddress: string;
    quadraticFundingConfig?: {
      matchingFundsAvailable: number;
      matchingCap: boolean;
      matchingCapAmount?: number;
      minDonationThreshold?: boolean;
      minDonationThresholdAmount?: number;
      sybilDefense?: boolean;
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
  votingStrategy: string;
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
  ownedBy: string;
  /**
   * Addresses of wallets that will have admin privileges to operate the Grant program
   */
  operatorWallets?: Array<string>;
  /**
   * List of projects approved for the round
   */
  approvedProjects?: Project[];
}

export type TimestampVariables = {
  applicationsStartTime_lte?: string;
  applicationsEndTime_gt?: string;
  applicationsEndTime_lt?: string;
  applicationsEndTime?: string;
  applicationsEndTime_gte?: string;
  roundStartTime_lt?: string;
  roundStartTime_gt?: string;
  roundEndTime_gt?: string;
  roundEndTime_lt?: string;
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

export type Collection = {
  id: string;
  author: string;
  name: string;
  images: string[];
  description: string;
  applicationRefs: string[];
};

export type Application = {
  id: string;
  chainId: string;
  roundId: string;
  projectId: string;
  status: ApplicationStatus;
  totalAmountDonatedInUsd: number;
  totalDonationsCount: string;
  uniqueDonorsCount: number;
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
  };
  metadata: {
    application: {
      recipient: string;
      answers: GrantApplicationFormAnswer[];
    };
  };
};
