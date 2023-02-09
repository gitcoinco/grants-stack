// This script deals with updating
import hre, { ethers } from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { merklePayoutStrategyParams } from "../config/merklePayoutStrategy.config";
import * as utils from "../utils";

utils.assertEnvironment();

export async function main(
  merklePayoutStrategyFactoryContract?: string,
  merklePayoutStrategyImplementationContract?: string
) {
  const network = hre.network;

  const networkParams = merklePayoutStrategyParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  if (!merklePayoutStrategyFactoryContract) {
    merklePayoutStrategyFactoryContract =
      networkParams.merklePayoutStrategyFactoryContract;
  }

  if (!merklePayoutStrategyImplementationContract) {
    merklePayoutStrategyImplementationContract =
      networkParams.merklePayoutStrategyImplementationContract;
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
    merklePayoutStrategyImplementationContract:
      merklePayoutStrategyImplementationContract,
    network: network.name,
    chainId: network.config.chainId,
  });

  // Update RoundImplementation
  const updateTx = await merkleFactory.updateMerklePayoutStrategyContract(
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
