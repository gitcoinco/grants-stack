// This script deals with updating
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';


export async function main(grantRoundFactoryContract?: string, grantRoundImplementationContract?: string) {

  const network = hre.network;

  const networkParams = roundParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  if (!grantRoundFactoryContract) {
    grantRoundFactoryContract = networkParams.grantRoundFactoryContract;
  }

  if (!grantRoundImplementationContract) {
    grantRoundImplementationContract = networkParams.grantRoundImplementationContract;
  }

  if (!grantRoundFactoryContract) {
    throw new Error(`error: missing grantRoundFactoryContract`);
  }

  if (!grantRoundImplementationContract) {
    throw new Error(`error: missing grantRoundImplementationContract`);
  }

  const grantRoundFactory = await ethers.getContractAt('GrantRoundFactory', grantRoundFactoryContract);
  
  await confirmContinue({
    "contract"                          : "GrantRoundFactory",
    "grantRoundFactoryContract"         : grantRoundFactoryContract,
    "grantRoundImplementationContract"  : grantRoundImplementationContract,
    "network"                           : network.name,
    "chainId"                           : network.config.chainId
  });

  // Update GrantRoundImplementation 
  const updateTx = await grantRoundFactory.updateGrantRoundContract(grantRoundImplementationContract)
  await updateTx.wait();

  console.log("✅ GrantRoundContract updated");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
