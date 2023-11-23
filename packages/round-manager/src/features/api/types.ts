/**
 * Supported EVM networks
 */
import { Signer } from "@ethersproject/abstract-signer";
import { Web3Provider } from "@ethersproject/providers";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { BigNumber } from "ethers";
import { SchemaQuestion } from "./utils";
import { RoundVisibilityType } from "common";

export type Network = "optimism" | "fantom" | "pgn";

export interface Web3Instance {
  /**
   * Currently selected address in ETH format i.e 0x...
   */
  address: string;
  /**
   * Chain ID & name of the currently connected network
   */
  chain: {
    id: number;
    name: string;
    network: Network;
  };
  provider: Web3Provider;
  signer?: Signer;
}

export enum StorageProtocolID {
  IPFS = 1,
}

export interface MetadataPointer {
  /**
   * The decentralized storage protocol
   * Read more here: https://github.com/gitcoinco/grants-round/blob/main/packages/contracts/docs/MetaPtrProtocol.md
   */
  protocol: StorageProtocolID;
  /**
   * The identifier which represents the program metadata on a decentralized storage
   */
  pointer: string;
}

export interface IPFSObject {
  /**
   * File content to be saved in IPFS
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  content: object | Blob;
  /**
   * Optional metadata
   */
  metadata?: {
    name?: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    keyvalues?: object;
  };
}

/** Base Contract interface */
export interface Contract {
  /**
   * Contract address
   */
  address?: string;
  /**
   * Contract ABI in Human Readable ABI format
   */
  abi: Array<string>;
  /**
   * Contract ABI in binary format
   */
  bytecode?: string;
}

export interface Program {
  /**
   * The on-chain unique program ID
   */
  id?: string;
  /**
   * Metadata of the Grant Program to be stored off-chain
   */
  metadata: {
    name: string;
  };
  /**
   * Pointer to a decentralized storage e.g IPFS, Ceramic etc.
   */
  store?: MetadataPointer;
  /**
   * Addresses of wallets that will have admin privileges to operate the Grant program
   */
  operatorWallets: Array<string>;
  /**
   * Network Chain Information
   */
  chain?: {
    id: number;
    name?: string;
    logo?: string;
  };
}

export type InputType =
  | "email"
  | "address"
  | "number"
  | "text"
  | "short-answer"
  | "paragraph"
  | "multiple-choice"
  | "checkbox"
  | "dropdown"
  | "link";

export type EditQuestion = {
  index?: number;
  field?: SchemaQuestion;
};

export type ProjectRequirements = {
  twitter: {
    required: boolean;
    verification: boolean;
  };
  github: {
    required: boolean;
    verification: boolean;
  };
};

export interface ApplicationMetadata {
  questions?: SchemaQuestion[];
  requirements: ProjectRequirements;
}

export enum RoundCategory {
  QuadraticFunding,
  Direct,
}

export interface Round {
  /**
   * The on-chain unique round ID
   */
  id?: string;

  chainId?: number;

  /**
   * Metadata of the Round to be stored off-chain
   */
  roundMetadata: {
    name: string;
    programContractAddress: string;
    roundType: RoundVisibilityType;
    eligibility?: {
      description: string;
      requirements: { requirement: string }[];
    };
    quadraticFundingConfig: {
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
   * Metadata of a round application to be stored off-chain
   */
  applicationMetadata?: ApplicationMetadata;
  /**
   * Pointer to application metadata in a decentralized storage e.g IPFS, Ceramic etc.
   */
  applicationStore?: MetadataPointer;
  /**
   * Voting contract address
   */
  votingStrategy: string;
  /**
   * Payout contract address
   */
  payoutStrategy: {
    id: string;
    isReadyForPayout?: boolean;
    vaultAddress?: string;
    strategyName?: string;
  };
  /**
   * Used in RoundCategory.Direct
   * Is the address from where the grant will be paid out
   */
  vaultAddress?: string;
  /**
   * Unix timestamp of the start of the round
   */
  roundStartTime: Date;
  /**
   * Unix timestamp of the end of the round
   */
  roundEndTime: Date;
  /**
   * enable/disable validations for round end time
   */
  roundEndTimeDisabled?: boolean;
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
  approvedProjects?: ApprovedProject[];
  /**
   * Round fees percentage
   */
  feesPercentage?: number;
  /**
   * Round fees address
   */
  feesAddress?: string;

  finalized: boolean;
  protocolFeePercentage?: number;
  roundFeePercentage?: number;
}

export type MatchingStatsData = {
  index?: number;
  projectName: string;
  uniqueContributorsCount?: number;
  contributionsCount: number;
  matchPoolPercentage: number;
  projectId: string;
  applicationId: string;
  matchAmountInToken: BigNumber;
  originalMatchAmountInToken: BigNumber;
  projectPayoutAddress: string;
  status?: string;
  hash?: string;
};

export type ProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "APPEAL"
  | "FRAUD"
  | "IN_REVIEW";

export type ProjectCredentials = {
  [key: string]: VerifiableCredential;
};
interface ProjectOwner {
  address: string;
}

export type ApprovedProject = {
  grantApplicationId: GrantApplicationId;
  projectRegistryId: ProjectRegistryId;
  recipient: recipient;
  projectMetadata: ProjectMetadata;
  status: ApplicationStatus;
};
export type GrantApplicationId = string;
export type ProjectRegistryId = string;
export type recipient = string;

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
};

export type RoundProject = {
  id: string;
  status: ApplicationStatus;
  payoutAddress: string;
};

export interface GrantApplication {
  /**
   * The on-chain unique grant application ID
   */
  id: GrantApplicationId;
  /**
   * The round contract address applied to
   */
  round: string;
  /**
   * Recipient wallet address of grantee
   */
  recipient: string;
  /**
   * Project information
   */
  project?: Project;
  /** List of answers to questions */
  answers?: Array<AnswerBlock>;
  /**
   * Pointer to the list of approved/rejected grant applications in a decentralized storage
   * e.g IPFS, Ceramic etc.
   */
  projectsMetaPtr: MetadataPointer;
  /**
   * Status of each grant application
   */
  status?: ProjectStatus; // handle round status 0,1,2,3
  inReview?: boolean; // handle payoutStatus for DirectStrategy

  projectId?: string;

  payoutStrategy?: {
    strategyName: string;
    id: string;
    payouts: {
      applicationIndex: number;
      amount: string;
      createdAt: string;
      txnHash: string;
    }[];
  };

  statusSnapshots?: {
    status: ProjectStatus;
    statusDescription: string;
    timestamp: Date;
  }[];

  /**
   * Index of a grant application
   */
  applicationIndex?: number;
  /**
   * Created timestamp of a grant application
   */
  createdAt: string;
}

export type AnswerBlock = {
  questionId: number;
  question: string;
  answer?: string;
  type?: string;
  encryptedAnswer?: {
    ciphertext: string;
    encryptedSymmetricKey: string;
  };
};

export enum ProgressStatus {
  IS_SUCCESS = "IS_SUCCESS",
  IN_PROGRESS = "IN_PROGRESS",
  NOT_STARTED = "NOT_STARTED",
  IS_ERROR = "IS_ERROR",
}

// TODO - what is the difference between ApplicationStatus and ProjectStatus (L155)
export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  IN_REVIEW = "IN_REVIEW",
}

export type Status = {
  index: number;
  status: number;
};

export type StatusForDirectPayout = {
  index: number;
  status: boolean;
};

export type AppStatus = {
  index: number;
  statusRow: string;
};

export type ProgressStep = {
  name: string;
  description: string;
  status: ProgressStatus;
};

export type Project = {
  lastUpdated: number; // unix timestamp in milliseconds
  createdAt: number; // unix timestamp in miliseconds
  id: string;
  owners: ProjectOwner[];
  title: string;
  description: string;
  website: string;
  bannerImg?: string;
  logoImg?: string;
  projectGithub?: string;
  userGithub?: string;
  projectTwitter?: string;
  credentials: ProjectCredentials;
  metaPtr: MetadataPointer;
};

export type TransactionBlock = {
  transactionBlockNumber: number;
  error?: unknown;
};

export type EditedGroups = {
  ApplicationMetaPointer: boolean;
  MatchAmount: boolean;
  RoundFeeAddress: boolean;
  RoundFeePercentage: boolean;
  RoundMetaPointer: boolean;
  StartAndEndTimes: boolean;
};
