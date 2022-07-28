/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import abi from "./abi"
import { Contract } from "./types"


/** ProgramFactory  */
export const programFactoryContract = (chainId: number|undefined): Contract => {
  let address;

  switch (chainId) {
    case 10: {
      // optimism network
      address = "0x0"; // TODO: update with contract address
      break;
    }
    case 69: {
      // optimism-kovan network
      address = "0x21AE9Cd37c5981841Be9f0168Ee8dBCeb67bcCC2"
      break;
    }
    default: {
      // goerli network
      address = "0x9F7caF160E9674BbF7159eb302c350680Ac09eF6";
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
export const roundFactoryContract = (chainId: number|undefined): Contract => {
  let address;

  switch (chainId) {
    case 10: {
      // optimism network
      address = "0x0"; // TODO: update with contract address
      break;
    }
    case 69: {
      // optimism-kovan network
      address = "0x5632fdD467B657AEc800296F1695cf8847A50048"
      break;
    }
    default: {
      // goerli network
      address = "0xFed628443dEbcE553EB6053566dFabE0537348f2";
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