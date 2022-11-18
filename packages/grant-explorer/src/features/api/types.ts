import { Signer } from "@ethersproject/abstract-signer";
import { Web3Provider } from "@ethersproject/providers";
import { VerifiableCredential } from "@gitcoinco/passport-sdk-types";

export type Network = "goerli" | "optimism" | "Fantom";

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
  /**
   * Contract ABI in binary format
   */
  bytecode?: string;
}

// TODO: Document this
export interface Requirement {
  requirement?: string;
}

// TODO: Document this
export interface Eligibility {
  description: string;
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
    eligibility: Eligibility;
    programContractAddress: string;
    matchingFunds?: {
      matchingFundsAvailable: number;
      matchingCap: boolean;
      matchingCapAmount?: number;
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

export type Project = {
  grantApplicationId: GrantApplicationId;
  projectRegistryId: ProjectRegistryId;
  recipient: recipient;
  projectMetadata: ProjectMetadata;
  status: ApplicationStatus;
};
export type GrantApplicationId = string;
export type ProjectRegistryId = string;
export type recipient = string;

export type FinalBallotDonation = {
  projectRegistryId: ProjectRegistryId,
  amount: number;
  projectAddress: recipient;
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
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
  chainId: string;
  address: string;
  decimal: number;
  logo?: string;
  default?: boolean; // TODO: this is only used to provide the initial placeholder item, look for better solution
};
