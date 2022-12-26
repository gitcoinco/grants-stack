// This script deals with upgrading the RoundFactory on a given network
// https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import * as utils from "../../utils";
import { QFVotingParams } from '../../config/votingStrategy.config';

utils.assertEnvironment();


export async function main() {

  const network = hre.network;

  const networkParams = QFVotingParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const QFImplementationContract = networkParams.implementation;

  if (!QFImplementationContract) {
    console.log("error: set QFImplementationContract in votingStrategy.config");
    return;
  }

  await confirmContinue({
    "contract"        : "QuadraticFundingVotingStrategyImplementation",
    "contract type"   : "upgrade",
    "currentContract" : QFImplementationContract,
    "network"         : hre.network.name,
    "chainId"         : hre.network.config.chainId
  });

  const newQuadraticFundingVotingStrategyImplementation = await ethers.getContractFactory("QuadraticFundingVotingStrategyImplementation");

  console.log("Upgrading QuadraticFundingVotingStrategyImplementation...");

  const contract = await upgrades.upgradeProxy(QFImplementationContract, newQuadraticFundingVotingStrategyImplementation);

  console.log(`QFImplementation is now upgraded. Check ${contract.address}`);

  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
