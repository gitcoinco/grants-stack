/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import abi from "./abi"
import { Contract } from "./types"



/** ProgramFactory  */
export const programFactoryContract: Contract = {
  address: "0x21AE9Cd37c5981841Be9f0168Ee8dBCeb67bcCC2",
  abi: abi.programFactory
}

/** ProgramImplementation */
export const programImplementationContract: Contract = {
  abi: abi.programImplementation
}

/** RoundFactory  */
export const roundFactoryContract: Contract = {
  address: "0x5632fdD467B657AEc800296F1695cf8847A50048",
  abi: abi.roundFactory
}

/** RoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation
}