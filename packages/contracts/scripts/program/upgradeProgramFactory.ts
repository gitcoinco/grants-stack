// This script deals with upgrading the ProgramFactory on a given network
// https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { programParams } from "../config/program.config";
import * as utils from "../utils";

utils.assertEnvironment();

// note: update anytime the program factory contract is to be upgraded
const config = {
  currentContract: "ProgramFactory", // needed only for forceful import
  newContract: "ProgramFactory",
}

export async function main() {

  const network = hre.network;

  const networkParams = programParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  if (config.currentContract == '' || config.newContract == '') {
    console.log("error: config is missing values");
    return;
  }

  const proxyAddress = networkParams.programFactoryContract;
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

  await confirmContinue({
    "contract"  : "Upgrading ProgramFactory to new version",
    "currentContract": config.currentContract,
    "newContract": config.newContract,
    "network"   : hre.network.name,
    "chainId"   : hre.network.config.chainId,
    "proxyAddress": proxyAddress,
    "implementationAddress": implementationAddress,
    "adminAddress": adminAddress,
  });
  

  // const currentProgramFactory = await ethers.getContractFactory(config.currentContract);

  // console.log("Forcing import...");

  // await upgrades.forceImport(
  //   proxyAddress, currentProgramFactory, { kind: 'transparent' }
  // );

  console.log("Upgrading ProgramFactory...");

  const newProgramFactory = await ethers.getContractFactory(config.newContract);

  const newContract = await upgrades.upgradeProxy(proxyAddress, newProgramFactory);
  console.log("ProgramFactory upgraded");

  console.log("Version: "+ await newContract.VERSION());

  console.log(`ProgramFactory is now upgraded. Check ${proxyAddress}`);

  return newContract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
