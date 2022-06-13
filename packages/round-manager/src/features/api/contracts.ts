/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import abi from "./abi"
import { Contract } from "./types"



/** ProgramFactory  */
export const programFactoryContract: Contract = {
  address: "0x0EbD2E2130b73107d0C45fF2E16c93E7e2e10e3a",
  abi: abi.programFactory
}

/** ProgramImplementation */
export const programImplementationContract: Contract = {
  abi: abi.programImplementation
}

/** RoundFactory  */
export const roundFactoryContract: Contract = {
  address: "0x8CECC7587d9bC7db93f5a797c90264b6048cc590",
  abi: abi.roundFactory
}

/** RoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation
}