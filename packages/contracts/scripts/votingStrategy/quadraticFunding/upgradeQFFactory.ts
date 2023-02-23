// This script deals with upgrading the QuadraticFundingVotingStrategyFactory on a given network
// https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies
// https://github.com/ericglau/hardhat-deployer/blob/master/scripts/upgrade.js

import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { QFVotingParams } from '../../config/votingStrategy.config';
import * as utils from "../../utils";

utils.assertEnvironment();

// note: update anytime the factory contract is to be upgraded
const config = {
  currentContract: "QuadraticFundingVotingStrategyFactory", // needed only for forceful import
  newContract: "QuadraticFundingVotingStrategyFactory",
}

export async function main() {

  const network = hre.network;

  const networkParams = QFVotingParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }
  
  if (config.currentContract == '' || config.newContract == '') {
    console.log("error: config is missing values");
    return;
  }
  
  const proxyAddress = networkParams.factory;
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

  await confirmContinue({
    "contract"  : "Upgrading QuadraticFundingVotingStrategyFactory to new version",
    "currentContract": config.currentContract,
    "newContract": config.newContract,
    "network"   : hre.network.name,
    "chainId"   : hre.network.config.chainId,
    "proxyAddress": proxyAddress,
    "implementationAddress": implementationAddress,
    "adminAddress": adminAddress,
  });

  // const currentQuadraticFundingVotingStrategyFactory = await ethers.getContractFactory(config.currentContract);

  // console.log("Forcing import...");

  // const qfFactory = await upgrades.forceImport(
  //   proxyAddress, currentQuadraticFundingVotingStrategyFactory, { kind: 'transparent' }
  // );

  console.log("Upgrading QuadraticFundingVotingStrategyFactory...");

  const newQuadraticFundingVotingStrategyFactory = await ethers.getContractFactory(config.newContract);

  const newContract = await upgrades.upgradeProxy(proxyAddress, newQuadraticFundingVotingStrategyFactory);
  console.log("QuadraticFundingVotingStrategyFactory upgraded");

  console.log("Version: "+ await newContract.VERSION());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
