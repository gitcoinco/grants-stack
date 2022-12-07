import hre, { ethers, upgrades } from "hardhat";
import { prompt, prettyNum } from "../../lib/utils";
import { LedgerSigner } from "@anders-t/ethers-ledger";

async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = await hre.network.name;
  let account;
  let accountAddress;

  if(process.env.USE_HARDWARE_WALLET==="true") {
    // with hardware wallet
    console.log("Waiting for hardware wallet to connect...");
    account = new LedgerSigner(ethers.provider);
  } else {
    // default without hardware wallet
    account = (await ethers.getSigners())[0];
  }

  accountAddress = await account.getAddress();
  const balance = await ethers.provider.getBalance(accountAddress);

  console.log(`chainId: ${network.chainId}`);
  console.log(`network: ${networkName} (from ethers: ${network.name})`);
  console.log(`account: ${accountAddress}`);
  console.log(`balance: ${prettyNum(balance.toString())}`);

  await prompt("do you want to deploy the ProjectRegistry contract?");
  console.log("deploying...");

  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry", account);
  const instance = await upgrades.deployProxy(ProjectRegistry, []);
  console.log("tx hash", instance.deployTransaction.hash);
  await instance.deployed();

  const rec = await instance.deployTransaction.wait();
  const gas = prettyNum(rec.gasUsed.toString());
  console.log(`gas used: ${gas}`)

  console.log("ProjectRegistry deployed to:", instance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
