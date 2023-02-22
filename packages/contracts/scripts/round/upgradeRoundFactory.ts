// This script deals with upgrading the RoundFactory on a given network
// https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies
// https://github.com/ericglau/hardhat-deployer/blob/master/scripts/upgrade.js
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from "../config/round.config";
import * as utils from "../utils";

utils.assertEnvironment();

// note: update anytime the round contract is to be upgraded
const config = {
  currentContract: "RoundFactoryV0", // needed only for forceful import
  newContract: "RoundFactory",
}

export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }
  
  if (config.currentContract == '' || config.newContract == '') {
    console.log("error: config is missing values");
    return;
  }
  
  const proxyAddress = networkParams.roundFactoryContract;
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

  await confirmContinue({
    "contract"  : "Upgrading RoundFactory to new version",
    "currentContract": config.currentContract,
    "newContract": config.newContract,
    "network"   : hre.network.name,
    "chainId"   : hre.network.config.chainId,
    "proxyAddress": proxyAddress,
    "implementationAddress": implementationAddress,
    "adminAddress": adminAddress,
  });

  // const currentRoundFactory = await ethers.getContractFactory(config.currentContract);

  // console.log("Forcing import...");

  // const roundFactory = await upgrades.forceImport(
  //   proxyAddress, currentRoundFactory, { kind: 'transparent' }
  // );

  console.log("Upgrading RoundFactory...");

  const newRoundFactory = await ethers.getContractFactory(config.newContract);

  const newContract = await upgrades.upgradeProxy(proxyAddress, newRoundFactory);
  console.log("RoundFactory upgraded");

  console.log("Version: "+ await newContract.VERSION());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
