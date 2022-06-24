export interface Web3Instance {
  /**
   * Currently selected address in ETH format i.e 0x...
   */
  account: string;
  /**
   * Chain ID of the currently connected network
   */
  chainId: number;
}

export interface Metadata {
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

export interface IPFSFile {
  /**
   * File content to be saved in IPFS
   */
  content: string;
  /**
   * Optional path
   */
  path?: string;
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
    name: string
  };
  /**
   * Pointer to a decentralized storage e.g IPFS, Ceramic etc.
   */
  store?: Metadata;
  /**
   * Addresses of wallets that will have admin privileges to operate the Grant program
   */
  operatorWallets: Array<string>;
}

export interface Round {
  /**
   * The on-chain unique program ID
   */
  id?: string;
  /**
   * Metadata of the Round to be stored off-chain
   */
  metadata?: {
    name: string
  };
  /**
   * Pointer to a decentralized storage e.g IPFS, Ceramic etc.
   */
  store?: Metadata;
  /**
   * Voting contract address
   */
  votingContract: string;
  /**
   * Unix timestamp of the start of the round
   */
  startTime: Date;
  /**
   * Unix timestamp of the end of the round
   */
  endTime: Date;
  /**
   * Unix timestamp of when grants can apply to a round
   */
  applicationStartTime: Date;
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

/** This non-nested interface exists for form validation */
export interface RoundForm extends Round {
  name?: string;
}