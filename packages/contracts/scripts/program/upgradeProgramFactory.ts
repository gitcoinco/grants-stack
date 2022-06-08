// This script deals with upgrading the ProgramFactory on a given network
// https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { programParams } from "../config/program.config";


// note: update anytime the program contract is to be upgraded
const config = {
  currentProgramContract: "ProgramFactory",
  newProgramContract: "DummyProgramFactory"
}

export async function main() {

  const network = hre.network;

  const networkParams = programParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const programFactoryContract = networkParams.programFactoryContract;

  if (!config.newProgramContract || config.newProgramContract == '') {
    console.log("error: set config.newProgramContract with the new contract to be deployed");
    return;
  }
  
  await confirmContinue({
    "contract"  : "Upgrading ProgramFactory to new version",
    "factory contract": programFactoryContract,
    "currentProgramContract": config.currentProgramContract,
    "newProgramContract": config.newProgramContract,
    "network"   : hre.network.name,
    "chainId"   : hre.network.config.chainId
  });

  console.log("Upgrading program factory");

  const newContractFactory = await ethers.getContractFactory(config.newProgramContract);

  const contract = await upgrades.upgradeProxy(programFactoryContract, newContractFactory);

  console.log(`ProgramFactory is now upgraded. Check ${programFactoryContract}`);

  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
