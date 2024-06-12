import { FallbackProvider, JsonRpcProvider } from "@ethersproject/providers";

export interface Global {
  web3Provider: JsonRpcProvider | FallbackProvider | undefined;
  signer: any | undefined;
  chainID: number | undefined;
  address: string | undefined;
}

export const global: Global = {
  web3Provider: undefined,
  signer: undefined,
  chainID: undefined,
  address: undefined,
};
