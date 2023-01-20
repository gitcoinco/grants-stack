// This is a helper script to create a program.
// This should be created via the frontend and this script is meant to be used for quick test
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { QFRelayParams } from "../../config/votingStrategy.config";
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main() {
  const network = hre.network;

  const networkParams = QFRelayParams[network.name];
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const votingRelayFactoryContract = networkParams.factory;
  const votingRelayImplementationContract = networkParams.implementation;

  if (!votingRelayFactoryContract) {
    throw new Error(`error: missing factory`);
  }

  if (!votingRelayImplementationContract) {
    throw new Error(`error: missing implementation`);
  }

  const QFRelayStrategyFactory = await ethers.getContractAt(
    "QuadraticFundingRelayStrategyFactory",
    votingRelayFactoryContract
  );

  await confirmContinue({
    info: "create a QF voting strategy",
    QFVotingRelayStrategyFactoryContract: votingRelayFactoryContract,
    QFVotingRelayStrategyImplementationContract:
      votingRelayImplementationContract,
    network: network.name,
    chainId: network.config.chainId,
  });

  const votingStrategyTx = await QFRelayStrategyFactory.create();

  const receipt = await votingStrategyTx.wait();
  let votingStrategyAddress;

  if (receipt.events) {
    const event = receipt.events.find(
      (e) => e.event === "VotingContractCreated"
    );
    if (event && event.args) {
      votingStrategyAddress = event.args.votingContractAddress;
    }
  }

  console.log("✅ Txn hash: " + votingStrategyTx.hash);
  console.log("✅ QF Voting contract created: ", votingStrategyAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
