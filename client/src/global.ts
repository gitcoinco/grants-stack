// import { Web3Provider } from "@ethersproject/providers";
import { Provider, Signer } from "@wagmi/core";

export interface Global {
  web3Provider: Provider | undefined;
  signer: any | undefined;
  chainID: number | undefined;
}

export const global: Global = {
  web3Provider: undefined,
  signer: undefined,
  chainID: undefined,
};
