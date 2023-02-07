import { Provider } from "@wagmi/core";

export interface Global {
  web3Provider: Provider | undefined;
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
