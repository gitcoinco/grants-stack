// This script deals with upgrading the MerklePayoutStrategyFactory on a given network
// https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies
// https://github.com/ericglau/hardhat-deployer/blob/master/scripts/upgrade.js
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { MerklePayoutParams } from "../../config/payoutStrategy.config";
import * as utils from "../../utils";

utils.assertEnvironment();

// note: update anytime the merkle factory contract is to be upgraded
const config = {
  currentContract: "MerklePayoutStrategyFactoryV0", // needed only for forceful import
  newContract: "MerklePayoutStrategyFactory",
}

export async function main() {

  const network = hre.network;

  const networkParams = MerklePayoutParams[network.name];
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
    "contract"  : "Upgrading MerklePayoutStrategyFactory to new version",
    "currentContract": config.currentContract,
    "newContract": config.newContract,
    "network"   : hre.network.name,
    "chainId"   : hre.network.config.chainId,
    "proxyAddress": proxyAddress,
    "implementationAddress": implementationAddress,
    "adminAddress": adminAddress,
  });

  // const currentMerklePayoutStrategyFactory = await ethers.getContractFactory(config.currentContract);

  // console.log("Forcing import...");

  // const merklePayoutStrategyFactory = await upgrades.forceImport(
  //   proxyAddress, currentMerklePayoutStrategyFactory, { kind: 'transparent' }
  // );

  console.log("Upgrading MerklePayoutStrategyFactory...");

  const newMerklePayoutStrategyFactory = await ethers.getContractFactory(config.newContract);

  const newContract = await upgrades.upgradeProxy(proxyAddress, newMerklePayoutStrategyFactory);
  console.log("MerklePayoutStrategyFactory upgraded");

  console.log("Version: "+ await newContract.VERSION());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
