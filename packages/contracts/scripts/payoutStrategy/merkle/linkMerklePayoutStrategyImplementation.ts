// This script deals with linking the implemention to the factory contract
import hre, { ethers } from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { MerklePayoutParams } from "../../config/payoutStrategy.config";
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main(
  merklePayoutStrategyFactoryContract?: string,
  merklePayoutStrategyImplementationContract?: string
) {
  const network = hre.network;

  const networkParams = MerklePayoutParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  if (!merklePayoutStrategyFactoryContract) {
    merklePayoutStrategyFactoryContract = networkParams.factory;
  }

  if (!merklePayoutStrategyImplementationContract) {
    merklePayoutStrategyImplementationContract = networkParams.implementation;
  }

  if (!merklePayoutStrategyFactoryContract) {
    throw new Error(`error: missing merklePayoutStrategyFactoryContract`);
  }

  if (!merklePayoutStrategyImplementationContract) {
    throw new Error(
      `error: missing merklePayoutStrategyImplementationContract`
    );
  }

  const merkleFactory = await ethers.getContractAt(
    "MerklePayoutStrategyFactory",
    merklePayoutStrategyFactoryContract
  );

  await confirmContinue({
    contract: "MerklePayoutStrategyFactory",
    merklePayoutStrategyFactoryContract: merklePayoutStrategyFactoryContract,
    merklePayoutStrategyImplementationContract: merklePayoutStrategyImplementationContract,
    network: network.name,
    chainId: network.config.chainId,
  });

  // Update PayoutImplementation
  const updateTx = await merkleFactory.updatePayoutImplementation(
    merklePayoutStrategyImplementationContract
  );
  await updateTx.wait();

  console.log(
    "✅ MerklePayoutStrategyImplementation Contract linked to Merkle Payout Strategy Contract",
    updateTx.hash
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
