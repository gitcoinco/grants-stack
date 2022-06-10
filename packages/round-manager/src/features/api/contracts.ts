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

/** GrantRoundFactory  */
export const roundFactoryContract: Contract = {
  address: "0x2f97819a05051cC0983988B9E49331E679741309",
  abi: abi.roundFactory
}

/** GrantRoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation
}