// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = '';
  const contractName = "ProgramFactory";

  const contract = await ethers.getContractFactory(contractName);
  console.log('Implementation address: ' + await upgrades.erc1967.getImplementationAddress(proxyAddress));
  console.log('Admin address: ' + await upgrades.erc1967.getAdminAddress(proxyAddress));

  await upgrades.forceImport(proxyAddress, contract, { kind: 'transparent' });

  console.log("force import done");
}

main();