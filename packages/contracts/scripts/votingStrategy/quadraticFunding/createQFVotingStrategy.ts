// This is a helper script to create a program. 
// This should be created via the frontend and this script is meant to be used for quick test
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import {  QFVotingParams } from '../../config/votingStrategy.config';
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main() {

  const network = hre.network;

  const networkParams = QFVotingParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const votingFactoryContract = networkParams.factory;
  const votingImplementationContract = networkParams.implementation;

  
  if (!votingFactoryContract) {
    throw new Error(`error: missing factory`);
  }

  if (!votingImplementationContract) {
    throw new Error(`error: missing implementation`);
  }


  const QFVotingStrategyFactory = await ethers.getContractAt('QuadraticFundingVotingStrategyFactory', votingFactoryContract);
  
  await confirmContinue({
    "info"                                    : "create a QF voting strategy",
    "QFVotingStrategyFactoryContract"         : votingFactoryContract,
    "QFVotingStrategyImplementationContract"  : votingImplementationContract,
    "network"                                 : network.name,
    "chainId"                                 : network.config.chainId
  });


  const votingStrategyTx = await QFVotingStrategyFactory.create();

  const receipt = await votingStrategyTx.wait();
  let votingStrategyAddress;

  if (receipt.events) {
    const event = receipt.events.find(e => e.event === 'VotingContractCreated');
    if (event && event.args) {
      votingStrategyAddress = event.args.votingContractAddress;
    }
  }

  console.log("✅ Txn hash: " + votingStrategyTx.hash);
  console.log("✅ QF Voting contract created: ", votingStrategyAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
