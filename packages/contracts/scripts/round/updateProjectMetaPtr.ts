// This script deals with updating a rounds projectMetaPtr.
// Ideally this would be done via the UI and not this script
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';


const roundConfig  = {
  metaPtr: {
    protocol: 1,
    pointer: "bafybeigayocgcsj6efydq67ymitgx7nq4y754g6nohf3wgackd7ff7rx54"
  }
}
export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const contract = networkParams.roundContract;
  if (!contract) {
    throw new Error(`Missing contrat for network ${network.name}`);
  }

  const round = await ethers.getContractAt('RoundImplementation', contract);

  await confirmContinue({
    "contract"                     : "RoundImplementation",
    "round"                        : contract,
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
