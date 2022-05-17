import { Web3Provider } from "@ethersproject/providers";
import { IPFS } from "ipfs-core-types";

export interface Global {
  web3Provider: Web3Provider | undefined;
  ipfs: IPFS | undefined;
}

export const global: Global = {
  web3Provider: undefined,
  ipfs: undefined,
};
