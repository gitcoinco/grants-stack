import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";

// TODO `RoundPayoutType` and `RoundVisibilityType` are duplicated from `common` to
// avoid further spaghetti dependencies. They should probably be relocated here.
export type RoundPayoutType = "MERKLE" | "DIRECT";
export type RoundVisibilityType = "public" | "private";

export type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

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

export type Project = {
  grantApplicationId: string;
  projectRegistryId: string;
  recipient: string;
  projectMetadata: ProjectMetadata;
  grantApplicationFormAnswers: GrantApplicationFormAnswer[];
  status: ApplicationStatus;
  applicationIndex: number;
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

export interface Requirement {
  // Requirement for the round
  requirement?: string;
}

export interface Eligibility {
  // Eligibility for the round
  description: string;
  // Requirements for the round
  requirements?: Requirement[];
}

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
