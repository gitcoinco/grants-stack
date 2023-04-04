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
      address = "0xe0281a20dFaCb0E179E6581c33542bC533DdC4AB";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x8918401DD47f1645fF1111D8E513c0404b84d5bB";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "0xe0281a20dFaCb0E179E6581c33542bC533DdC4AB";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "0xbB8f276FE1D52a38FbED8845bCefb9A23138Af92";
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
export const roundFactoryContract = (
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0xE2Bf906f7d10F059cE65769F53fe50D8E0cC7cBe";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0x0f0A4961274A578443089D06AfB9d1fC231A5a4D";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "0x3e7f72DFeDF6ba1BcBFE77A94a752C529Bb4429E";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "0x00F51ba2Cd201F4bFac0090F450de0992a838762";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x24F9EBFAdf095e0afe3d98635ee83CD72e49B5B0";
      break;
    }
  }

  return {
    address: address,
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
  chainId: ChainId | undefined
): Contract => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0xE1F4A28299966686c689223Ee7803258Dbde0942";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "0x6038fd0D126CA1D0b2eA8897a06575100f7b16C2";
      break;
    }
    case ChainId.GOERLI_CHAIN_ID:
    default: {
      address = "0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38";
      break;
    }
  }

  return {
    address: address,
    abi: abi.qfVotingStrategyFactory,
  };
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
      address = "0xE2Bf906f7d10F059cE65769F53fe50D8E0cC7cBe";
      break;
    }
  }

  return {
    address: address,
    abi: abi.merklePayoutStrategyFactory,
  };
};

/* MerklePayoutStrategyImplementation */
export const merklePayoutStrategyImplementationContract: Contract = {
  abi: abi.merklePayoutStrategyImplementation,
};
