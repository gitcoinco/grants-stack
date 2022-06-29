import hre, { ethers, upgrades } from "hardhat";
import { prompt, prettyNum } from "../../lib/utils";

const PROXY_ADDRESS = undefined;

async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = await hre.network.name;
  const [account] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(account.address);

  if (PROXY_ADDRESS === undefined) {
    console.error("set the PROXY_ADDRESS variable");
    process.exit(1);
  }

  console.log(`chainId: ${network.chainId}`);
  console.log(`network: ${networkName} (from ethers: ${network.name})`);
  console.log(`account: ${account.address}`);
  console.log(`balance: ${prettyNum(balance.toString())}`);
  console.log(`proxy address: ${PROXY_ADDRESS}`);

  await prompt("do you want to upgrade the ProjectRegistry contract to V2?");
  console.log("deploying...");

  const ProjectRegistryV2 = await ethers.getContractFactory("ProjectRegistryV2");
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, ProjectRegistryV2);
  console.log("tx hash", upgraded.deployTransaction.hash);
  await upgraded.deployed();

  console.log("ProjectRegistryV2 deployed to:", upgraded.address);

  console.log("initializing...");
  await upgraded.initialize(/* args */);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
