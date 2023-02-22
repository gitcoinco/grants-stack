import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';
import * as utils from "../utils";

utils.assertEnvironment();
  
export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const roundFactoryContract = networkParams.roundFactoryContract;

  const roundFactory = await ethers.getContractAt('RoundFactory', roundFactoryContract);

  const currentProtocolFeePercentage = await roundFactory.protocolFeePercentage();
  const currentProtocolTreasury = await roundFactory.protocolTreasury();

  const newProtocolTreasury = networkParams.newProtocolTreasury;
  const newProtocolFeePercentage = networkParams.newProtocolFeePercentage;
  
  await confirmContinue({
    "info"                         : "set protocol percentage and treasury address",
    "roundFactoryContract"         : roundFactoryContract,
    "currentProtocolTreasury"      : currentProtocolTreasury,
    "newProtocolTreasury"          : newProtocolTreasury,
    "currentProtocolFeePercentage" : currentProtocolFeePercentage,
    "newProtocolFeePercentage"     : newProtocolFeePercentage,
    "network"                      : network.name,
    "chainId"                      : network.config.chainId
  });


  if (newProtocolTreasury && newProtocolTreasury != currentProtocolTreasury) {
    console.log("setting protocol fee treasury to: " + newProtocolTreasury);
    const tx = await roundFactory.updateProtocolTreasury(
      newProtocolTreasury
    );

    console.log("✅ Txn hash: " + tx.hash);
  }  

  if (newProtocolFeePercentage && newProtocolFeePercentage != currentProtocolFeePercentage) {
    console.log("setting protocol fee percentage to: " + newProtocolFeePercentage);
    const tx = await roundFactory.updateProtocolFeePercentage(
      newProtocolFeePercentage
    );

    console.log("✅ Txn hash: " + tx.hash);
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
