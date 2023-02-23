// This is a helper script to create a merkle payout contract. 
// This should be created via the frontend and this script is meant to be used for quick test
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { MerklePayoutParams } from '../../config/payoutStrategy.config';
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main() {

  const network = hre.network;

  const networkParams = MerklePayoutParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const payoutFactoryContract = networkParams.factory;
  const payoutImplementationContract = networkParams.implementation;

  
  if (!payoutFactoryContract) {
    throw new Error(`error: missing factory`);
  }

  if (!payoutImplementationContract) {
    throw new Error(`error: missing implementation`);
  }


  const MerklePayoutStrategyFactory = await ethers.getContractAt('MerklePayoutStrategyFactory', payoutFactoryContract);
  
  await confirmContinue({
    "info"                                        : "create a merkle payout strategy contract",
    "MerklePayoutStrategyFactoryContract"         : payoutFactoryContract,
    "MerklePayoutStrategyImplementationContract"  : payoutImplementationContract,
    "network"                                     : network.name,
    "chainId"                                     : network.config.chainId
  });


  const payoutStrategyTx = await MerklePayoutStrategyFactory.create();

  const receipt = await payoutStrategyTx.wait();
  let payoutStrategyAddress;

  if (receipt.events) {
    const event = receipt.events.find(e => e.event === 'PayoutContractCreated');
    if (event && event.args) {
      payoutStrategyAddress = event.args.payoutContractAddress;
    }
  }

  console.log("✅ Txn hash: " + payoutStrategyTx.hash);
  console.log("✅ Merkle Payout contract created: ", payoutStrategyAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
