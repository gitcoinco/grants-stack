/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import {
  directPayoutStrategyFactoryContractMap,
  merklePayoutStrategyFactoryMap,
  programFactoryMap,
  projectRegistryMap,
  qfVotingStrategyFactoryMap,
  roundFactoryMap,
} from "common/src/allo/addresses/allo-v1";
import abi from "./abi";
import { Contract } from "./types";

/************************/
/* == External ABI == */
/************************/

/* GrantHub's ProjectRegistry */
export const projectRegistryContract = (chainId: number): Contract => {
  return {
    address: projectRegistryMap[chainId],
    abi: abi.projectRegistry,
  };
};

/* ERC20 */
export const ERC20Contract: Contract = {
  abi: abi.erc20,
};

/************************/
/* ===== Program ====== */
/************************/
/* ProgramFactory  */
export const programFactoryContract = (chainId: number): Contract => {
  return {
    address: programFactoryMap[chainId],
    abi: abi.programFactory,
  };
};

/************************/
/* ====== Round ======= */
/************************/

/* RoundFactory  */
export const roundFactoryContract = (
  chainId: number
): Contract & { address: string } => {
  return {
    address: roundFactoryMap[chainId],
    abi: abi.roundFactory,
  };
};

/* RoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation,
};

/************************/
/* == VotingStrategy == */
/************************/
/* QuadraticFundingVotingStrategy */
export const qfVotingStrategyFactoryContract = (
  chainId: number
): Contract & { address: string } => {
  return {
    address: qfVotingStrategyFactoryMap[chainId],
    abi: abi.qfVotingStrategyFactory,
  };
};

/* VotingStrategyFactory */

/************************/
/* == PayoutStrategy == */
/************************/

export const merklePayoutStrategyFactoryContract = (
  chainId: number
): Contract & { address: string } => {
  return {
    address: merklePayoutStrategyFactoryMap[chainId],
    abi: abi.merklePayoutStrategyFactory,
  };
};

/* MerklePayoutStrategyImplementation */
export const merklePayoutStrategyImplementationContract: Contract = {
  abi: abi.merklePayoutStrategyImplementation,
};

/* DirectPayoutStrategyFactoryContract  */
export const directPayoutStrategyFactoryContract = (
  chainId: number
): Contract & { address: string } => {
  return {
    address: directPayoutStrategyFactoryContractMap[chainId],
    abi: [],
  };
};
