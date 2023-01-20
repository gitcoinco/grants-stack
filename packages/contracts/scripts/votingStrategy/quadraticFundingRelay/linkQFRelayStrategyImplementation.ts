// This script deals with link the QF Implementation to QF Factory
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { QFRelayParams } from "../../config/votingStrategy.config";
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main(
  quadraticFundingRelayStrategyFactoryContract?: string,
  quadraticFundingRelayStrategyImplementationContract?: string
) {
  const network = hre.network;

  const networkParams = QFRelayParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  if (!quadraticFundingRelayStrategyFactoryContract) {
    quadraticFundingRelayStrategyFactoryContract = networkParams.factory;
  }

  if (!quadraticFundingRelayStrategyImplementationContract) {
    quadraticFundingRelayStrategyImplementationContract =
      networkParams.implementation;
  }

  if (!quadraticFundingRelayStrategyFactoryContract) {
    throw new Error(
      `error: missing quadraticFundingRelayStrategyFactoryContract`
    );
  }

  if (!quadraticFundingRelayStrategyImplementationContract) {
    throw new Error(
      `error: missing quadraticFundingRelayStrategyImplementationContract`
    );
  }

  const quadraticFundingVotingStrategyFactory = await ethers.getContractAt(
    "QuadraticFundingRelayStrategyFactory",
    quadraticFundingRelayStrategyFactoryContract
  );

  await confirmContinue({
    contract: "QuadraticFundingRelayStrategyFactory",
    QFVotingStrategyFactoryContract:
      quadraticFundingRelayStrategyImplementationContract,
    QFVotingStrategyImplementationContract:
      quadraticFundingRelayStrategyImplementationContract,
    network: network.name,
    chainId: network.config.chainId,
  });

  // Update QuadraticFundingVotingStrategyImplementation
  const updateTx =
    await quadraticFundingVotingStrategyFactory.updateVotingContract(
      quadraticFundingRelayStrategyImplementationContract
    );
  await updateTx.wait();

  console.log(
    "✅ QuadraticFundingRelayStrategyImplementation Contract Linked to QuadraticFundingRelayStrategyFactory contract"
  );
  console.log("Txn hash", updateTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
