import hre, { ethers } from "hardhat";
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

  await prompt("do you want to deploy the GrantsRegistry contract?");
  console.log("deploying...")

  const GrantsRegistry = await ethers.getContractFactory("GrantsRegistry");
  const instance = await GrantsRegistry.deploy();
  console.log("tx hash", instance.deployTransaction.hash);
  console.log(instance)
  await instance.deployed();

  console.log("GrantsRegistry deployed to:", instance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
