import { LedgerSigner } from "@anders-t/ethers-ledger";
import hre, { ethers, upgrades } from "hardhat";
import { confirmContinue, prettyNum } from "../../utils/script-utils";
import { projectRegistryParams } from "../config/projectRegistry.config";

const PROXY_ADDRESS = undefined;

async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = await hre.network.name;
  let account;
  let accountAddress;



  const networkParams = projectRegistryParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const PROXY_ADDRESS = networkParams.proxyContactAddress;

  if (!PROXY_ADDRESS) {
    throw new Error(`error: missing PROXY_ADDRESS`);
  }

  if(process.env.USE_HARDWARE_WALLET === "true") {
    // with hardware wallet
    console.log("Waiting for hardware wallet to connect...");
    account = new LedgerSigner(ethers.provider as any);
  } else {
    // default without hardware wallet
    account = (await ethers.getSigners())[0];
  }

  accountAddress = await account.getAddress();

  const balance = await ethers.provider.getBalance(accountAddress);

  console.log(`This script upgrades the ProjectRegistry contract to V2 on ${networkName}`);

  await confirmContinue({
    contract: "Upgrading ProjectRegistry",
    chainId: network.chainId,
    network: network.name,
    account: accountAddress,
    balance: prettyNum(balance.toString()),
    proxyAddress: PROXY_ADDRESS,
  });

  console.log("Upgrading...");

  const ProjectRegistryV2 = await ethers.getContractFactory("ProjectRegistryV2", account);
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
