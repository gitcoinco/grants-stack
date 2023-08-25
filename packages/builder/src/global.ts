import { Provider } from "@wagmi/core";
import { ChainId } from "common";

export interface Global {
  web3Provider: Provider | undefined;
  signer: any | undefined;
  chainID: ChainId | undefined;
  address: string | undefined;
}

export const global: Global = {
  web3Provider: undefined,
  signer: undefined,
  chainID: undefined,
  address: undefined,
};
