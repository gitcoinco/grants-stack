// This script deals with updating
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { programParams } from '../../config/program.config';
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main(quadraticFundingVotingStrategyFactoryContract?: string, quadraticFundingVotingStrategyImplementationContract?: string) {

  const network = hre.network;

  const networkParams = programParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  if (!quadraticFundingVotingStrategyFactoryContract) {
    quadraticFundingVotingStrategyFactoryContract = networkParams.quadraticFundingVotingStrategyFactoryContract;
  }

  if (!quadraticFundingVotingStrategyImplementationContract) {
    quadraticFundingVotingStrategyImplementationContract = networkParams.quadraticFundingVotingStrategyImplementationContract;
  }

  if (!quadraticFundingVotingStrategyFactoryContract) {
    throw new Error(`error: missing quadraticFundingVotingStrategyFactoryContract`);
  }

  if (!quadraticFundingVotingStrategyImplementationContract) {
    throw new Error(`error: missing quadraticFundingVotingStrategyImplementationContract`);
  }

  const quadraticFundingVotingStrategyFactory = await ethers.getContractAt('QuadraticFundingVotingStrategyFactory', quadraticFundingVotingStrategyFactoryContract);
  
  await confirmContinue({
    "contract"                                : "QuadraticFundingVotingStrategyFactory",
    "QFVotingStrategyFactoryContract"         : quadraticFundingVotingStrategyFactoryContract,
    "QFVotingStrategyImplementationContract"  : quadraticFundingVotingStrategyImplementationContract,
    "network"                                 : network.name,
    "chainId"                                 : network.config.chainId
  });

  // Update QuadraticFundingVotingStrategyImplementation 
  const updateTx = await quadraticFundingVotingStrategyFactory.updateProgramContract(quadraticFundingVotingStrategyImplementationContract)
  await updateTx.wait();

  console.log("✅ QuadraticFundingVotingStrategyImplementation Contract Linked to QuadraticFundingVotingStrategyFactory contract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
