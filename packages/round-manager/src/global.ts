import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";

export interface Global {
  web3Provider: Web3Provider | undefined;
  web3Signer: Signer | undefined;
}

export const global: Global = {
  web3Provider: undefined,
  web3Signer: undefined,
};
