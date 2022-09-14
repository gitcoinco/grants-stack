import { Web3Provider } from "@ethersproject/providers"
import { Signer } from "@ethersproject/abstract-signer"
import { IPFS } from "ipfs-core-types"

export interface Global {
  web3Provider: Web3Provider | undefined;
  web3Signer: Signer | undefined;
  ipfs: IPFS | undefined;
}

export const global: Global = {
  web3Provider: undefined,
  web3Signer: undefined,
  ipfs: undefined
}