/**
 * Supported EVM networks
 */
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";

export type Network = "goerli" | "optimism" | "optimism-kovan";

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
  provider: any;
  signer?: any;
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
}

export interface Program {
  /**
   * The on-chain unique program ID
   */
  id?: string;
  /**
   * Metadata of the Grant Program to be stored off-chain
   */
  metadata?: {
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
}

export interface ApplicationMetadata {
  customQuestions?: {
    email?: string;
    twitter?: string;
    website?: string;
    github?: string;
    githubOrganization?: string;
    fundingSource?: string;
    profit2022?: string;
    teamSize?: string;
  };
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
}

export type ProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "APPEAL"
  | "FRAUD";

export type ProjectCredentials = {
  [key: string]: VerifiableCredential;
};

export type GrantApplicationId = string;

interface Owner {
  address: string;
}

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
  project?: {
    lastUpdated: number; // unix timestamp in milliseconds
    id: string;
    owners: Owner[];
    title: string;
    description: string;
    website: string;
    bannerImg?: string;
    logoImg: string;
    credentials: ProjectCredentials;
    metaPtr: MetadataPointer;
  };
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
