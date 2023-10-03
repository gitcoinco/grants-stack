/**
 * This file contains all contract definitions for Gitcoin Grants Round Manager
 */

import abi from "./abi";
import { Contract } from "./types";
import { ChainId } from "common";

type ChainIdToStringMap = Record<ChainId, string>;

/************************/
/* == External ABI == */
/************************/

const projectRegistryMap: ChainIdToStringMap = {
  [ChainId.MAINNET]: "0x03506eD3f57892C85DB20C36846e9c808aFe9ef4",
  [ChainId.GOERLI_CHAIN_ID]: "0xa71864fAd36439C50924359ECfF23Bb185FFDf21",
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]:
    "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174",
  [ChainId.FANTOM_MAINNET_CHAIN_ID]:
    "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174",
  [ChainId.FANTOM_TESTNET_CHAIN_ID]:
    "0x984749e408FF0446d8ADaf20E293F2F299396631",
  [ChainId.PGN_TESTNET]: "0x6294bed5B884Ae18bf737793Ef9415069Bf4bc11",
  [ChainId.PGN]: "0xDF9BF58Aa1A1B73F0e214d79C652a7dd37a6074e",
  [ChainId.ARBITRUM]: "0x73AB205af1476Dc22104A6B8b3d4c273B58C6E27",
  [ChainId.ARBITRUM_GOERLI]: "0x0CD135777dEaB6D0Bb150bDB0592aC9Baa4d0871",
  [ChainId.FUJI]: "0x8918401DD47f1645fF1111D8E513c0404b84d5bB",
  [ChainId.AVALANCHE]: "0xDF9BF58Aa1A1B73F0e214d79C652a7dd37a6074e",
  [ChainId.POLYGON]: "0x5C5E2D94b107C7691B08E43169fDe76EAAB6D48b",
  [ChainId.POLYGON_MUMBAI]: "0x545B282A50EaeA01A619914d44105437036CbB36",
};

/* GrantHub's ProjectRegistry */
export const projectRegistryContract = (chainId: ChainId): Contract => {
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
const programFactoryMap: ChainIdToStringMap = {
  [ChainId.MAINNET]: "0x56296242CA408bA36393f3981879fF9692F193cC",
  [ChainId.GOERLI_CHAIN_ID]: "0x79Ba35cb31620db1b5b101A9A13A1b0A82B5BC9e",
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]:
    "0xd5Fb00093Ebd30011d932cB69bb6313c550aB05f",
  [ChainId.FANTOM_MAINNET_CHAIN_ID]:
    "0x4d1f64c7920262c8F78e989C9E7Bf48b7eC02Eb5",
  [ChainId.FANTOM_TESTNET_CHAIN_ID]:
    "0x424C5C175fbd46CA0b27866044A5B956c6AbEe0D",
  [ChainId.PGN_TESTNET]: "0x2Ff06F96Bb265698e47BfdED83f1aa0aC7c3a4Ce",
  [ChainId.PGN]: "0xd07D54b0231088Ca9BF7DA6291c911B885cBC140",
  [ChainId.ARBITRUM]: "0xDF9BF58Aa1A1B73F0e214d79C652a7dd37a6074e",
  [ChainId.ARBITRUM_GOERLI]: "0xd39b40aC9279EeeB86FBbDeb2C9acDF16e16cF89",
  [ChainId.FUJI]: "0x862D7F621409cF572f179367DdF1B7144AcE1c76",
  [ChainId.AVALANCHE]: "0xd07D54b0231088Ca9BF7DA6291c911B885cBC140",
  [ChainId.POLYGON]: "0xF7c101A95Ea4cBD5DA0Ab9827D7B2C9857440143",
  [ChainId.POLYGON_MUMBAI]: "0xDF9BF58Aa1A1B73F0e214d79C652a7dd37a6074e",
};
/* ProgramFactory  */
export const programFactoryContract = (chainId: ChainId): Contract => {
  return {
    address: programFactoryMap[chainId],
    abi: abi.programFactory,
  };
};

/************************/
/* ====== Round ======= */
/************************/
const roundFactoryMap: ChainIdToStringMap = {
  [ChainId.MAINNET]: "0x9Cb7f434aD3250d1656854A9eC7A71EceC6eE1EF",
  [ChainId.GOERLI_CHAIN_ID]: "0x24F9EBFAdf095e0afe3d98635ee83CD72e49B5B0",
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]:
    "0x04E753cFB8c8D1D7f776f7d7A033740961b6AEC2",
  [ChainId.FANTOM_MAINNET_CHAIN_ID]:
    "0xfb08d1fD3a7c693677eB096E722ABf4Ae63B0B95",
  [ChainId.FANTOM_TESTNET_CHAIN_ID]:
    "0x8AdFcF226dfb2fA73788Ad711C958Ba251369cb3",
  [ChainId.PGN_TESTNET]: "0x0479b9DA9f287539FEBd597350B1eBaEBF7479ac",
  [ChainId.PGN]: "0x8AdFcF226dfb2fA73788Ad711C958Ba251369cb3",
  [ChainId.ARBITRUM_GOERLI]: "0xdf25423c9ec15347197Aa5D3a41c2ebE27587D59",
  [ChainId.ARBITRUM]: "0xF2a07728107B04266015E67b1468cA0a536956C8",
  [ChainId.FUJI]: "0x3615d870d5B760cea43693ABED70Cd8A9b59b3d8",
  [ChainId.AVALANCHE]: "0x8eC471f30cA797FD52F9D37A47Be2517a7BD6912",
  [ChainId.POLYGON]: "0x5ab68dCdcA37A1C2b09c5218e28eB0d9cc3FEb03",
  [ChainId.POLYGON_MUMBAI]: "0xE1c5812e9831bc1d5BDcF50AAEc1a47C4508F3fA",
};
/* RoundFactory  */
export const roundFactoryContract = (
  chainId: ChainId
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
const qfVotingStrategyFactoryMap: ChainIdToStringMap = {
  [ChainId.MAINNET]: "0x4a850F463D1C4842937c5Bc9540dBc803D744c9F",
  [ChainId.GOERLI_CHAIN_ID]: "0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38",
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]:
    "0x838C5e10dcc1e54d62761d994722367BA167AC22",
  [ChainId.FANTOM_MAINNET_CHAIN_ID]:
    "0x534d2AAc03dCd0Cb3905B591BAf04C14A95426AB",
  [ChainId.FANTOM_TESTNET_CHAIN_ID]:
    "0x545B282A50EaeA01A619914d44105437036CbB36",
  [ChainId.PGN_TESTNET]: "0xE8027a807Bb85e57da4B7A5ecE65b0aBDf231ce8",
  [ChainId.PGN]: "0x2AFA4bE0f2468347A2F086c2167630fb1E58b725",
  [ChainId.ARBITRUM_GOERLI]: "0x0BFA0AAF5f2D81f859e85C8E82A3fc5b624fc6E8",
  [ChainId.ARBITRUM]: "0xC3A195EEa198e74D67671732E1B8F8A23781D735",
  [ChainId.FUJI]: "0xd39b40aC9279EeeB86FBbDeb2C9acDF16e16cF89",
  [ChainId.AVALANCHE]: "0x2AFA4bE0f2468347A2F086c2167630fb1E58b725",
  [ChainId.POLYGON]: "0xc1a26b0789C3E93b07713e90596Cad8d0442C826",
  [ChainId.POLYGON_MUMBAI]: "0xF7c101A95Ea4cBD5DA0Ab9827D7B2C9857440143",
};
/* QuadraticFundingVotingStrategy */
export const qfVotingStrategyFactoryContract = (
  chainId: ChainId
): Contract & { address: string } => {
  return {
    address: qfVotingStrategyFactoryMap[chainId],
    abi: abi.qfVotingStrategyFactory,
  };
};

/* VotingStrategyFactory */
export const dgVotingStrategyDummyContract = (chainId: ChainId): string => {
  let address;

  switch (chainId) {
    case ChainId.MAINNET: {
      address = "0xDF9BF58Aa1A1B73F0e214d79C652a7dd37a6074e";
      break;
    }
    case ChainId.OPTIMISM_MAINNET_CHAIN_ID: {
      address = "0xB9fd0d433d2ca03D26A182Dc709bA1EccA3B00cC";
      break;
    }
    case ChainId.FANTOM_MAINNET_CHAIN_ID: {
      address = "0xB91749077A0dE932a4AE2b882d846ef9C53b9505";
      break;
    }
    case ChainId.FANTOM_TESTNET_CHAIN_ID: {
      address = "0xc7722909fEBf7880E15e67d563E2736D9Bb9c1Ab";
      break;
    }
    case ChainId.PGN_TESTNET: {
      address = "0xDF9BF58Aa1A1B73F0e214d79C652a7dd37a6074e";
      break;
    }
    case ChainId.PGN: {
      address = "0xcE7c30DbcEC2a98B516E4C64fA4E3256AB813b10";
      break;
    }
    case ChainId.ARBITRUM_GOERLI: {
      address = "0x809E751e5C5bB1446e9ab2Ac37c687a35DE53BC6";
      break;
    }
    case ChainId.ARBITRUM: {
      address = "0x5ab68dCdcA37A1C2b09c5218e28eB0d9cc3FEb03";
      break;
    }
    case ChainId.FUJI: {
      address = "0xCd3618509983FE4990D7770CF6f02c7145dC365F";
      break;
    }
    case ChainId.AVALANCHE: {
      address = "0xA78Daa89fE9C1eC66c5cB1c5833bC8C6Cb307918";
      break;
    }
    case ChainId.POLYGON: {
      address = "0x8142cAa6dED9F63434B1ED862d53E06332874570";
      break;
    }
    case ChainId.POLYGON_MUMBAI: {
      address = "0xA78Daa89fE9C1eC66c5cB1c5833bC8C6Cb307918";
      break;
    }
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
const merklePayoutStrategyFactoryMap: ChainIdToStringMap = {
  [ChainId.MAINNET]: "0x8F8d78f119Aa722453d33d6881f4D400D67D054F",
  [ChainId.GOERLI_CHAIN_ID]: "0xE2Bf906f7d10F059cE65769F53fe50D8E0cC7cBe",
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]:
    "0xB5365543cdDa2C795AD104F4cB784EF3DB1CD383",
  [ChainId.FANTOM_MAINNET_CHAIN_ID]:
    "0xFA1D9FF7F885757fc20Fdd9D78B72F88B00Cff77",
  [ChainId.FANTOM_TESTNET_CHAIN_ID]:
    "0x5b55728e41154562ee80027C1247B13382692e5C",
  [ChainId.PGN_TESTNET]: "0xE42D1Da8d75Cf1d6f6C460DAa3f1b10a79D689B1",
  [ChainId.PGN]: "0x27efa1C90e097c980c669AB1a6e326AD4164f1Cb",
  [ChainId.ARBITRUM_GOERLI]: "0x8F8d78f119Aa722453d33d6881f4D400D67D054F",
  [ChainId.ARBITRUM]: "0x04b194b14532070F5cc8D3A760c9a0957D85ad5B",
  [ChainId.FUJI]: "0x8F8d78f119Aa722453d33d6881f4D400D67D054F",
  [ChainId.AVALANCHE]: "0x27efa1C90e097c980c669AB1a6e326AD4164f1Cb",
  [ChainId.POLYGON]: "0xD0e19DBF9b896199F35Df255A1bf8dB3C787531c",
  [ChainId.POLYGON_MUMBAI]: "0xc1a26b0789C3E93b07713e90596Cad8d0442C826",
};
export const merklePayoutStrategyFactoryContract = (
  chainId: ChainId
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

/* AlloSettings contract  */

const alloSettingsContractMap: ChainIdToStringMap = {
  [ChainId.MAINNET]: "",
  [ChainId.GOERLI_CHAIN_ID]: "0x991cd65cb6AE183F06a489857775D7aE14794055",
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]: "",
  [ChainId.FANTOM_MAINNET_CHAIN_ID]: "",
  [ChainId.FANTOM_TESTNET_CHAIN_ID]: "",
  [ChainId.PGN_TESTNET]: "",
  [ChainId.PGN]: "",
  [ChainId.ARBITRUM_GOERLI]: "",
  [ChainId.ARBITRUM]: "",
  [ChainId.FUJI]: "",
  [ChainId.AVALANCHE]: "",
  [ChainId.POLYGON]: "",
  [ChainId.POLYGON_MUMBAI]: "",
};

/* AlloSettingsContract  */
export const alloSettingsContract = (
  chainId: ChainId
): Contract & { address: string } => {
  return {
    address: alloSettingsContractMap[chainId],
    abi: [],
  };
};

/* DirectPayoutStrategyFactoryContract contract  */

const directPayoutStrategyFactoryContractMap: ChainIdToStringMap = {
  [ChainId.MAINNET]: "0xd07D54b0231088Ca9BF7DA6291c911B885cBC140",
  [ChainId.GOERLI_CHAIN_ID]: "0x0077551e24bfB910aBABedC4336246e34B5fB0A2",
  [ChainId.OPTIMISM_MAINNET_CHAIN_ID]:
    "0x2Bb670C3ffC763b691062d671b386E51Cf1840f0",
  [ChainId.FANTOM_MAINNET_CHAIN_ID]:
    "0x9B1Ee60B539a3761E328a621A3d980EE9385679a",
  [ChainId.FANTOM_TESTNET_CHAIN_ID]:
    "0x8eC471f30cA797FD52F9D37A47Be2517a7BD6912",
  [ChainId.PGN_TESTNET]: "0x3D77E65aEA55C0e07Cb018aB4Dc22D38cAD75921",
  [ChainId.PGN]: "0x0c33c9dEF7A3d9961b802C6C6402d306b7D48135",
  [ChainId.ARBITRUM_GOERLI]: "0xCd3618509983FE4990D7770CF6f02c7145dC365F",
  [ChainId.ARBITRUM]: "0xc1a26b0789C3E93b07713e90596Cad8d0442C826",
  [ChainId.FUJI]: "0x0F98547e09D41e3c82086fC5Eb0E42Ab786aA763",
  [ChainId.AVALANCHE]: "0x8AdFcF226dfb2fA73788Ad711C958Ba251369cb3",
  [ChainId.POLYGON]: "0xF2a07728107B04266015E67b1468cA0a536956C8",
  [ChainId.POLYGON_MUMBAI]: "0xD9B7Ce1F68A93dF783A8519ed52b74f5DcF5AFE1",
};

/* DirectPayoutStrategyFactoryContract  */
export const directPayoutStrategyFactoryContract = (
  chainId: ChainId
): Contract & { address: string } => {
  return {
    address: directPayoutStrategyFactoryContractMap[chainId],
    abi: [],
  };
};
