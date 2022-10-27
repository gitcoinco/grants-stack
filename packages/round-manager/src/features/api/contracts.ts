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
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x548c775c4Bd61d873a445ee4E769cf1A18d60eA9";
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
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x5770b7a57BD252FC4bB28c9a70C9572aE6400E48";
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
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x0fF5962Bc56BA0Cf6D7d6EF90df274AE5dC4D16A";
    }
  }

  return {
    address: address,
    abi: abi.projectRegistry,
  };
};

export const qfVotingStrategyFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0xF741F7B6a4cb3B4869B2e2C01aB70A12575B53Ab";
    }
  }

  return {
    address: address,
    abi: abi.qfVotingStrategyFactory,
  };
};
