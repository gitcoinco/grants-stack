// This script deals with updating a rounds projectMetaPtr.
// Ideally this would be done via the UI and not this script
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';


const roundConfig  = {
  contract: "0x812c0bef016284b7a72a11ee737b6b0eae991f7b", // TODO: UDPATE
  metaPtr: {
    protocol: 1,
    pointer: "bafybeigpecznpyiyvuvrlemkkxguwtrwyiydovvtzsx5gihiqmmj33w5ua"
  }
}
export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const round = await ethers.getContractAt('RoundImplementation', roundConfig.contract);
  
  await confirmContinue({
    "contract"                     : "RoundImplementation",
    "round"                        : roundConfig.contract,
    "network"                      : network.name,
    "chainId"                      : network.config.chainId
  });

  // Update ProjectMetaPtr 
  const updateTx = await round.updateProjectsMetaPtr(roundConfig.metaPtr);
  await updateTx.wait();

  console.log("✅ projectMetaPtr updated: ", updateTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
