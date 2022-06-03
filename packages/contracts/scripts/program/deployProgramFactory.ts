// This script deals with deploying the ProgramFactory on a given network
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";

export async function main() {

  // Wait 10 blocks for re-org protection
  const blocksToWait = 10;
  
  await confirmContinue({
    "contract"  : "ProgramFactory",
    "network"   : hre.network.name,
    "chainId"   : hre.network.config.chainId
  });

  // Deploy ProgramFactory 
  const contractFactory = await ethers.getContractFactory("ProgramFactory");
  const contract = await upgrades.deployProxy(contractFactory);

  console.log(`Deploying Upgradable ProgramFactory to ${contract.address}`);

  await contract.deployTransaction.wait(blocksToWait);
  console.log("✅ Deployed.");

  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
