/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import abi from "./abi";
import { Contract } from "./types";
import { ChainId } from "./utils";

/** ProgramFactory  */
export const programFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0xB3Ee4800c93cBec7eD2a31050161240e4663Ff5E";
      break;
    }
    case ChainId.OPTIMISM_KOVAN_CHAIN_ID: {
      address = "0xea8b324E1099Ca0f82e8f50b2C2019eA1A2BA011";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x79c2394B20A809EA693a7D64323A8846FF02029c";
    }
  }

  return {
    address: address,
    abi: abi.programFactory,
  };
};

/** ProgramImplementation */
export const programImplementationContract: Contract = {
  abi: abi.programImplementation,
};

/** RoundFactory  */
export const roundFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x64ab6F2E11dF8B3Be5c8838eDe3951AC928daE9C";
      break;
    }
    case ChainId.OPTIMISM_KOVAN_CHAIN_ID: {
      address = "0x0d2d160Eff14f835B30e3f0EA83b50289A7d51aF";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x89f01CD69087669f8e49F6FB8aD475F622Ac8791";
    }
  }

  return {
    address: address,
    abi: abi.roundFactory,
  };
};

/** RoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation,
};
