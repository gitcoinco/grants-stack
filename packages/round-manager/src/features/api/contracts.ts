/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import abi from "./abi"
import { Contract } from "./types"



/** ProgramFactory  */
export const programFactoryContract: Contract = {
  address: "0x9F7caF160E9674BbF7159eb302c350680Ac09eF6",
  abi: abi.programFactory
}

/** ProgramImplementation */
export const programImplementationContract: Contract = {
  abi: abi.programImplementation
}

/** RoundFactory  */
export const roundFactoryContract: Contract = {
  address: "0xFed628443dEbcE553EB6053566dFabE0537348f2",
  abi: abi.roundFactory
}

/** RoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation
}