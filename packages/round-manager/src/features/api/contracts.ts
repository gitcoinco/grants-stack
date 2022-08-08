/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import abi from "./abi"
import { Contract } from "./types"
import { ChainId } from "./utils"


/** ProgramFactory  */
export const programFactoryContract = (chainId: ChainId | undefined): Contract => {
  let address;

  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0xea8b324E1099Ca0f82e8f50b2C2019eA1A2BA011";
      break;
    }
    case ChainId.OPTIMISM_KOVAN_CHAIN_ID: {
      address = "0xea8b324E1099Ca0f82e8f50b2C2019eA1A2BA011"
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x30875E085D988fAbadf3B5aE117061D607167f02";
    }
  }

  return {
    address: address,
    abi: abi.programFactory
  }
}

/** ProgramImplementation */
export const programImplementationContract: Contract = {
  abi: abi.programImplementation
}

/** RoundFactory  */
export const roundFactoryContract = (chainId: ChainId | undefined): Contract => {
  let address;

  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x0d2d160Eff14f835B30e3f0EA83b50289A7d51aF";
      break;
    }
    case ChainId.OPTIMISM_KOVAN_CHAIN_ID: {
      address = "0x0d2d160Eff14f835B30e3f0EA83b50289A7d51aF"
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x294e4D13919602f3B857fB2195628Fd5255e298a";
    }
  }

  return {
    address: address,
    abi: abi.roundFactory
  }
}

/** RoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation
}
