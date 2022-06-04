// This is a helper script to create a round. 
// This should be created via the frontend and this script is meant to be used for quick test
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';
  
export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const grantRoundFactoryContract = networkParams.grantRoundFactoryContract;
  const grantRoundImplementationContract = networkParams.grantRoundImplementationContract;

  
  if (!grantRoundFactoryContract) {
    throw new Error(`error: missing grantRoundFactoryContract`);
  }

  if (!grantRoundImplementationContract) {
    throw new Error(`error: missing grantRoundImplementationContract`);
  }


  const grantRoundFactory = await ethers.getContractAt('GrantRoundFactory', grantRoundFactoryContract);
  
  await confirmContinue({
    "info"                              : "create a GrantRound",
    "grantRoundFactoryContract"         : grantRoundFactoryContract,
    "grantRoundImplementationContract"  : grantRoundImplementationContract,
    "network"                           : network.name,
    "chainId"                           : network.config.chainId
  });

  const startTime = Math.round(new Date().getTime() / 1000 + 3600); // 1 hour later
  const applicationStartTime = Math.round(new Date().getTime() / 1000 + 172800); // 2 days later
  const endTime = Math.round(new Date().getTime() / 1000 + 864000); // 10 days later
    
  const roundTx = await grantRoundFactory.create(
      networkParams.bulkVoteContract, // _votingContract
      applicationStartTime, // _grantApplicationsStartTime
      startTime, // _roundStartTime
      endTime, // _roundEndTime
      '0x7f329D36FeA6b3AD10E6e36f2728e7e6788a938D', // _token
      { protocol: 1, pointer: "QmXVTmCGPnkYhCCiT7zyaK3HezVwijue4o7RH6BEY9Rmzu" }, // _metaPtr
      ['0x5cdb35fADB8262A3f88863254c870c2e6A848CcA', '0xB8cEF765721A6da910f14Be93e7684e9a3714123'] // _roundOperators
  );

  await roundTx.wait();

  console.log("✅ GrantRound created: ", roundTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
