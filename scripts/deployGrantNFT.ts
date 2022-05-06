import { ethers } from "hardhat";

async function main() {
  const GrantNFT = await ethers.getContractFactory("GrantNFT");

  // Start deployment, returning a promise that resolves to a contract object
  const myNFT = await GrantNFT.deploy();
  await myNFT.deployed();
  console.log("Contract deployed to address:", myNFT.address);
}

main().catch((error) => {
  console.error(error);
});
