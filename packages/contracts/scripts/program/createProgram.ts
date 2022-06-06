// This is a helper script to create a program. 
// This should be created via the frontend and this script is meant to be used for quick test
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { programParams } from '../config/program.config';

  
export async function main() {

  const network = hre.network;

  const networkParams = programParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const programFactoryContract = networkParams.programFactoryContract;
  const programImplementationContract = networkParams.programImplementationContract;

  
  if (!programFactoryContract) {
    throw new Error(`error: missing programFactoryContract`);
  }

  if (!programImplementationContract) {
    throw new Error(`error: missing programImplementationContract`);
  }


  const programFactory = await ethers.getContractAt('ProgramFactory', programFactoryContract);
  
  await confirmContinue({
    "info"                           : "create a Program",
    "programFactoryContract"         : programFactoryContract,
    "programImplementationContract"  : programImplementationContract,
    "network"                        : network.name,
    "chainId"                        : network.config.chainId
  });

  const roundTx = await programFactory.create(
      { protocol: 1, pointer: "QmXVTmCGPnkYhCCiT7zyaK3HezVwijue4o7RH6BEY9Rmzu" }, // _metaPtr
      ['0x5cdb35fADB8262A3f88863254c870c2e6A848CcA', '0xB8cEF765721A6da910f14Be93e7684e9a3714123'] // _programOperators
  );

  await roundTx.wait();

  console.log("✅ Program created: ", roundTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
