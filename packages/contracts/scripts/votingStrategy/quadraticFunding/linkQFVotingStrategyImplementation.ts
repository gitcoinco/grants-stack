// This script deals with link the QF Implementation to QF Factory
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { QFVotingParams } from '../../config/votingStrategy.config';
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main(quadraticFundingVotingStrategyFactoryContract?: string, quadraticFundingVotingStrategyImplementationContract?: string) {

  const network = hre.network;

  const networkParams = QFVotingParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  if (!quadraticFundingVotingStrategyFactoryContract) {
    quadraticFundingVotingStrategyFactoryContract = networkParams.factory;
  }

  if (!quadraticFundingVotingStrategyImplementationContract) {
    quadraticFundingVotingStrategyImplementationContract = networkParams.implementation;
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
  const updateTx = await quadraticFundingVotingStrategyFactory.updateVotingContract(quadraticFundingVotingStrategyImplementationContract)
  await updateTx.wait();

  console.log("✅ QuadraticFundingVotingStrategyImplementation Contract Linked to QuadraticFundingVotingStrategyFactory contract");
  console.log("Txn hash", updateTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
