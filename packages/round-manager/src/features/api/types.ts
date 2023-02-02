/**
 * Supported EVM networks
 */
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { Signer } from "@ethersproject/abstract-signer";
import { Web3Provider } from "@ethersproject/providers";

export type Network = "goerli" | "optimism";

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
  content: object | Blob;
  /**
   * Optional metadata
   */
  metadata?: {
    name?: string;
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

export type InputType = "email" | "number" | "text";

export type QuestionOptions = {
  title: string;
  required: boolean;
  encrypted: boolean;
  inputType: InputType;
};

export interface ApplicationMetadata {
  questions?: QuestionOptions[];
}

export interface Round {
  /**
   * The on-chain unique round ID
   */
  id?: string;
  /**
   * Metadata of the Round to be stored off-chain
   */
  roundMetadata: {
    name: string;
    programContractAddress: string;
    eligibility?: {
      description: string;
      requirements: { requirement: string }[];
    };
    matchingFunds?: {
      matchingFundsAvailable: number;
      matchingCap: boolean;
      matchingCapAmount?: number;
    };
    support?: {
      type: string;
      info: string;
    };
    voting?: string;
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
  payoutStrategy: string;
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
  approvedProjects?: ApprovedProject[];
}

export type MatchingStatsData = {
  projectName?: string;
  projectId: string;
  uniqueContributorsCount: number;
  matchPoolPercentage: number;
};

export type ProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "APPEAL"
  | "FRAUD";

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
  status?: ProjectStatus;
}

export type AnswerBlock = {
  questionId: number;
  question: string;
  answer?: string;
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
}

export type ProgressStep = {
  name: string;
  description: string;
  status: ProgressStatus;
};

export type Project = {
  lastUpdated: number; // unix timestamp in milliseconds
  id: string;
  owners: ProjectOwner[];
  title: string;
  description: string;
  website: string;
  bannerImg?: string;
  logoImg?: string;
  projectGithub?: string;
  projectTwitter?: string;
  credentials: ProjectCredentials;
  metaPtr: MetadataPointer;
};

export type VotingStrategy = "QFVoting" | "QFRelay";
