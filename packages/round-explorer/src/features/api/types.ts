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
