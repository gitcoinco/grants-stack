import hre, { ethers, upgrades } from "hardhat";
import { prompt, prettyNum } from "../../lib/utils";

async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = await hre.network.name;
  const [account] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(account.address);

  console.log(`chainId: ${network.chainId}`);
  console.log(`network: ${networkName} (from ethers: ${network.name})`);
  console.log(`account: ${account.address}`);
  console.log(`balance: ${prettyNum(balance.toString())}`);

  await prompt("do you want to deploy the ProjectRegistry contract?");
  console.log("deploying...");

  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const instance = await upgrades.deployProxy(ProjectRegistry, []);
  console.log("tx hash", instance.deployTransaction.hash);
  await instance.deployed();

  console.log("ProjectRegistry deployed to:", instance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
