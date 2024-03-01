import { ChainId } from "common";
import { WalletClient } from "wagmi";

import type { Project } from "data-layer";

export type {
  ApplicationStatus,
  GrantApplicationFormAnswer,
  ProjectCredentials,
  ProjectOwner,
  ProjectMetadata,
  Project,
  PayoutStrategy,
  MetadataPointer,
  Requirement,
  Eligibility,
  Round,
} from "data-layer";

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
  provider: WalletClient;
  signer?: WalletClient;
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

export type CartProject = Project & {
  roundId: string;
  chainId: ChainId;
  amount: string;
};

export enum ProgressStatus {
  IS_SUCCESS = "IS_SUCCESS",
  IN_PROGRESS = "IN_PROGRESS",
  NOT_STARTED = "NOT_STARTED",
  IS_ERROR = "IS_ERROR",
}
