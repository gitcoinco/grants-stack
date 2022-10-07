// This script deals with deploying QuadraticFundingVotingStrategy on a given network
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import * as utils from "../utils";

utils.assertEnvironment();

export async function main() {

  // Wait 10 blocks for re-org protection
  const blocksToWait = 10;
  
  await confirmContinue({
    "contract"  : "QuadraticFundingVotingStrategy",
    "network"   : hre.network.name,
    "chainId"   : hre.network.config.chainId
  });

  // Deploy RoundImplementation 
  const contractFactory = await ethers.getContractFactory("QuadraticFundingVotingStrategy");
  const contract = await contractFactory.deploy();

  console.log(`Deploying QuadraticFundingVotingStrategy to ${contract.address}`);
  await contract.deployTransaction.wait(blocksToWait);
  console.log("✅ Deployed.");

  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
