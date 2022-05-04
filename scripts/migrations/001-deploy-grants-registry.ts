import hre, { ethers, upgrades } from "hardhat";
import { prompt } from "../../lib/utils";

async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = await hre.network.name;
  const [account] = await ethers.getSigners();

  console.log(`chainId: ${network.chainId}`);
  console.log(`network: ${networkName} (from ethers: ${network.name})`);
  console.log(`account: ${account.address}`);

  await prompt("do you want to deploy the GrantsRegistry contract?");

  const GrantsRegistry = await ethers.getContractFactory("GrantsRegistry");
  const instance = await upgrades.deployProxy(GrantsRegistry, []);
  await instance.deployed();

  console.log("GrantsRegistry deployed to:", instance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
