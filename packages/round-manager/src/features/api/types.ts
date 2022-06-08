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

export interface Program {
  /**
   * The on-chain unique program ID
   */
  id?: string;
  /**
   * The identifier which represents the program metadata on a decentralized storage
   */
  metadataIdentifier: string;
  /**
   * Addresses of wallets that will have admin privileges to operate the Grant program
   */
  operatorWallets: Array<string>;
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