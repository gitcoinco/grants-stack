// This script deals with updating
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';


export async function main(roundFactoryContract?: string, roundImplementationContract?: string) {

  const network = hre.network;

  const networkParams = roundParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  if (!roundFactoryContract) {
    roundFactoryContract = networkParams.roundFactoryContract;
  }

  if (!roundImplementationContract) {
    roundImplementationContract = networkParams.roundImplementationContract;
  }

  if (!roundFactoryContract) {
    throw new Error(`error: missing roundFactoryContract`);
  }

  if (!roundImplementationContract) {
    throw new Error(`error: missing roundImplementationContract`);
  }

  const roundFactory = await ethers.getContractAt('RoundFactory', roundFactoryContract);
  
  await confirmContinue({
    "contract"                     : "RoundFactory",
    "roundFactoryContract"         : roundFactoryContract,
    "roundImplementationContract"  : roundImplementationContract,
    "network"                      : network.name,
    "chainId"                      : network.config.chainId
  });

  // Update RoundImplementation 
  const updateTx = await roundFactory.updateRoundContract(roundImplementationContract)
  await updateTx.wait();

  console.log("✅ RoundImplementation Contract linked to Round Contract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
