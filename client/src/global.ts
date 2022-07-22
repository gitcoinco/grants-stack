import { Web3Provider } from "@ethersproject/providers";

export interface Global {
  web3Provider: Web3Provider | undefined;
}

export const global: Global = {
  web3Provider: undefined,
};
