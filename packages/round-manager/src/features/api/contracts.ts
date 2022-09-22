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

export const projectRegistryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x832c5391dc7931312CbdBc1046669c9c3A4A28d5";
    }
  }

  return {
    address: address,
    abi: abi.projectRegistry,
  };
};
