// This script deals with deploying the QuadraticFundingVotingStrategyFactory on a given network
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import * as utils from "../utils";

utils.assertEnvironment();

export async function main() {
  // Wait 10 blocks for re-org protection
  const blocksToWait = hre.network.name === "localhost" ? 0 : 10;

  await confirmContinue({
    contract: "MerklePayoutStrategy",
    network: hre.network.name,
    chainId: hre.network.config.chainId,
  });

  // Deploy MerklePayoutStrategy
  const contractFactory = await ethers.getContractFactory(
    "MerklePayoutStrategyFactory"
  );
  const contract = await contractFactory.deploy();
  console.log(`Deploying MerklePayoutStrategyFactory to ${contract.address}`);
  const implementationFactory = await ethers.getContractFactory("MerklePayoutStrategyImplementation");
  const implementationContract = await implementationFactory.deploy();
  console.log(
    `Deploying MerklePayoutStrategyImplementation to ${implementationContract.address}`
  );

  await contract.deployTransaction.wait(blocksToWait);
  console.log("✅ Deployed.");

  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
