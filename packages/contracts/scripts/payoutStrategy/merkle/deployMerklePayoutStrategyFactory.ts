// This script deals with deploying the MerklePayoutStrategyFactory on a given network
import hre, { ethers, upgrades } from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main() {
  // Wait 10 blocks for re-org protection
  const blocksToWait = hre.network.name === "localhost" ? 0 : 10;

  await confirmContinue({
    contract: "MerklePayoutStrategyFactory",
    network: hre.network.name,
    chainId: hre.network.config.chainId,
  });

  // Deploy MerklePayoutStrategyFactory
  const contractFactory = await ethers.getContractFactory(
    "MerklePayoutStrategyFactory"
  );
  const contract = await upgrades.deployProxy(contractFactory);

  console.log(
    `Deploying Upgradable MerklePayoutStrategyFactory to ${contract.address}`
  );

  await contract.deployTransaction.wait(blocksToWait);

  console.log("✅ Deployed.");

  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
