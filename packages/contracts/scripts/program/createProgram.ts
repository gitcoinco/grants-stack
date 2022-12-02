// This is a helper script to create a program. 
// This should be created via the frontend and this script is meant to be used for quick test
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { programParams } from '../config/program.config';
import { encodeProgramParameters } from "../utils";
import * as utils from "../utils";

utils.assertEnvironment();

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


  const params = [
    { protocol: 1, pointer: "bafybeif43xtcb7zfd6lx7rfq42wjvpkbqgoo7qxrczbj4j4iwfl5aaqv2q" }, // _metaPtr
    [
      '0x5cdb35fADB8262A3f88863254c870c2e6A848CcA',
      '0xB8cEF765721A6da910f14Be93e7684e9a3714123',
      '0xA2A6460f20E43dcC5F8f55714A969500c342d7CE'
    ], // _adminRoles
    [
      '0x5cdb35fADB8262A3f88863254c870c2e6A848CcA',
      '0xB8cEF765721A6da910f14Be93e7684e9a3714123',
      '0xA2A6460f20E43dcC5F8f55714A969500c342d7CE',
      '0xf4c5c4deDde7A86b25E7430796441e209e23eBFB',
      '0x4873178BeA2DCd7022f0eF6c70048b0e05Bf9017',
      '0x6e8C1ADaEDb9A0A801dD50aFD95b5c07e9629C1E'
     ] // _programOperators
  ];

  const encodedParameters = encodeProgramParameters(params);

  const programTx = await programFactory.create(encodedParameters);

  const receipt = await programTx.wait();
  let programAddress;

  if (receipt.events) {
    const event = receipt.events.find(e => e.event === 'ProgramCreated');
    if (event && event.args) {
      programAddress = event.args.programContractAddress;
    }
  }

  console.log("✅ Txn hash: " + programTx.hash);
  console.log("✅ Program created: ", programAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
