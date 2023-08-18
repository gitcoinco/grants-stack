import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";
import { ChainId } from "common";
import { Hex } from "viem";
import { WalletClient } from "wagmi";

export type Network = "goerli" | "optimism" | "fantom" | "pgn";

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
  provider: WalletClient;
  signer?: WalletClient;
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
    roundType: string;
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

export type GrantApplicationFormAnswer = {
  questionId: number;
  question: string;
  answer: string | string[];
  hidden: boolean;
  type?: string;
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

export type CartProject = Project & {
  roundId: string;
  chainId: ChainId;
  amount: string;
};

export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

interface ProjectOwner {
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

export type ProjectCredentials = {
  [key: string]: VerifiableCredential;
};

export enum ProgressStatus {
  IS_SUCCESS = "IS_SUCCESS",
  IN_PROGRESS = "IN_PROGRESS",
  NOT_STARTED = "NOT_STARTED",
  IS_ERROR = "IS_ERROR",
}

export type PayoutToken = {
  name: string;
  chainId: ChainId;
  address: Hex;
  decimal: number;
  logo?: string;
  default?: boolean;
  redstoneTokenId?: string;
  permitVersion?: string;
  //TODO: remove if the previous default was intended to be used as defaultForVoting
  defaultForVoting: boolean;
  //TODO: split PayoutTokens and VotingTokens in
  // 2 different types/lists and remove the following attribute
  canVote: boolean;
};
