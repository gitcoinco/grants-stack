// This script deals with upgrading the RoundFactory on a given network
// https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from "../config/round.config";
import * as utils from "../utils";

utils.assertEnvironment();

// note: update anytime the round contract is to be upgraded
const config = {
  currentRoundFactoryContract: "RoundFactory",
  newRoundFactoryContract: "DummyRoundFactory"
}

export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const roundFactoryContract = networkParams.roundFactoryContract;

  if (!config.newRoundFactoryContract || config.newRoundFactoryContract == '') {
    console.log("error: set config.newRoundFactoryContract with the new contract to be deployed");
    return;
  }
  
  await confirmContinue({
    "contract"  : "Upgrading RoundFactory to new version",
    "factory contract": roundFactoryContract,
    "currentRoundFactoryContract": config.currentRoundFactoryContract,
    "newRoundFactoryContract": config.newRoundFactoryContract,
    "network"   : hre.network.name,
    "chainId"   : hre.network.config.chainId
  });

  console.log("Upgrading RoundFactory...");

  const newContractFactory = await ethers.getContractFactory(config.newRoundFactoryContract);

  const contract = await upgrades.upgradeProxy(roundFactoryContract, newContractFactory);

  console.log(`RoundFactory is now upgraded. Check ${roundFactoryContract}`);

  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
