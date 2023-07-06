/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import abi from "./abi";
import { Contract } from "./types";
import { ChainId } from "./utils";

/************************/
/* == External ABI == */
/************************/

/* GrantHub's ProjectRegistry */
export const projectRegistryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0x03506eD3f57892C85DB20C36846e9c808aFe9ef4";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "0x984749e408FF0446d8ADaf20E293F2F299396631";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0xa71864fAd36439C50924359ECfF23Bb185FFDf21";
      break;
    }
  }

  return {
    address: address,
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
export const programFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0x56296242CA408bA36393f3981879fF9692F193cC";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0xd5Fb00093Ebd30011d932cB69bb6313c550aB05f";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x79Ba35cb31620db1b5b101A9A13A1b0A82B5BC9e";
      break;
    }
  }

  return {
    address: address,
    abi: abi.programFactory,
  };
};

/* ProgramImplementation */
export const programImplementationContract: Contract = {
  abi: abi.programImplementation,
};

/************************/
/* ====== Round ======= */
/************************/

/* RoundFactory  */
export const roundFactoryContract = (chainId: ChainId | undefined): string => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0x9Cb7f434aD3250d1656854A9eC7A71EceC6eE1EF";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x04E753cFB8c8D1D7f776f7d7A033740961b6AEC2";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x24F9EBFAdf095e0afe3d98635ee83CD72e49B5B0";
      break;
    }
  }

  return address;
};

/* RoundImplementation */
export const roundImplementationContract: Contract = {
  abi: abi.roundImplementation,
};

/************************/
/* == VotingStrategy == */
/************************/

/* QFVotingStrategyFactory */
export const qfVotingStrategyFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0x4a850F463D1C4842937c5Bc9540dBc803D744c9F";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x838C5e10dcc1e54d62761d994722367BA167AC22";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x717A2cCDD81944e64c8BD9BB1D179A241dE14B46";

      break;
    }
  }

  return {
    address: address,
    abi: abi.qfVotingStrategyFactory,
  };
};

/* VotingStrategyFactory */
export const dgVotingStrategyDummyContract = (
  chainId: ChainId | undefined
): string => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x717A2cCDD81944e64c8BD9BB1D179A241dE14B46";
      break;
    }
  }

  return address;
};

/************************/
/* == PayoutStrategy == */
/************************/

/* MerklePayoutStrategyFactory */
export const merklePayoutStrategyFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0x8F8d78f119Aa722453d33d6881f4D400D67D054F";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0xB5365543cdDa2C795AD104F4cB784EF3DB1CD383";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0xE2Bf906f7d10F059cE65769F53fe50D8E0cC7cBe";
      break;
    }
  }

  return {
    address: address,
    abi: abi.merklePayoutStrategyFactory,
  };
};

export const directPayoutStrategyFactoryContract = (
  chainId: ChainId | undefined
): string => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x0077551e24bfB910aBABedC4336246e34B5fB0A2";
      break;
    }
  }

  return address;
};

/* MerklePayoutStrategyImplementation */
export const merklePayoutStrategyImplementationContract: Contract = {
  abi: abi.merklePayoutStrategyImplementation,
};

/* AlloSettings contract  */
export const alloSettingsContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x991cd65cb6AE183F06a489857775D7aE14794055";
      break;
    }
  }

  return {
    address: address,
    // For direct grants we have implemented typechain so it is not needed to export ABIs anymore.
    // that's why we are
    abi: [],
  };
};
