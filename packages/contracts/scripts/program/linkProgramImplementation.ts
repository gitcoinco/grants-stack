// This script deals with updating
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { programParams } from '../config/program.config';


export async function main(programFactoryContract?: string, programImplementationContract?: string) {

  const network = hre.network;

  const networkParams = programParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  if (!programFactoryContract) {
    programFactoryContract = networkParams.programFactoryContract;
  }

  if (!programImplementationContract) {
    programImplementationContract = networkParams.programImplementationContract;
  }

  if (!programFactoryContract) {
    throw new Error(`error: missing programFactoryContract`);
  }

  if (!programImplementationContract) {
    throw new Error(`error: missing programImplementationContract`);
  }

  const programFactory = await ethers.getContractAt('ProgramFactory', programFactoryContract);
  
  await confirmContinue({
    "contract"                       : "ProgramFactory",
    "programFactoryContract"         : programFactoryContract,
    "programImplementationContract"  : programImplementationContract,
    "network"                        : network.name,
    "chainId"                        : network.config.chainId
  });

  // Update ProgramImplementation 
  const updateTx = await programFactory.updateProgramContract(programImplementationContract)
  await updateTx.wait();

  console.log("✅ ProgramImplementation Contract Linked to ProgramFactory contract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
