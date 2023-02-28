// This is a helper script to create a round. 
// This should be created via the frontend and this script is meant to be used for quick test
// NOTE: this script deploys a round with a QF voting strategy an Merkle payout strategy
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';
import { programParams } from "../config/program.config";
import { QFVotingParams } from "../config/votingStrategy.config";
import { MerklePayoutParams } from "../config/payoutStrategy.config";
import { encodeRoundParameters } from "../utils";
import * as utils from "../utils";
import { AddressZero } from "@ethersproject/constants";

utils.assertEnvironment();
  
export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];
  const programNetworkParams = programParams[network.name];
  const votingNetworkParams = QFVotingParams[network.name];
  const payoutNetworkParams = MerklePayoutParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const roundFactoryContract = networkParams.roundFactoryContract;
  const roundImplementationContract = networkParams.roundImplementationContract;
  const programContract = programNetworkParams.programContract;

  const votingContract = votingNetworkParams.contract;
  const payoutContract = payoutNetworkParams.contract;
  
  if (!roundFactoryContract) {
    throw new Error(`error: missing roundFactoryContract`);
  }

  if (!roundImplementationContract) {
    throw new Error(`error: missing roundImplementationContract`);
  }

  if (!votingContract) {
    throw new Error(`error: missing votingContract`);
  }

  if (!payoutContract) {
    throw new Error(`error: missing payoutContract`);
  }

  const roundFactory = await ethers.getContractAt('RoundFactory', roundFactoryContract);
  
  await confirmContinue({
    "info"                         : "create a Round",
    "roundFactoryContract"         : roundFactoryContract,
    "roundImplementationContract"  : roundImplementationContract,
    "programContractAddress"       : programContract,
    "votingContractAddress"        : votingContract,
    "payoutContractAddress"        : payoutContract,
    "network"                      : network.name,
    "chainId"                      : network.config.chainId
  });

  const encodedParameters = generateAndEncodeRoundParam(votingContract, payoutContract);
  
  const roundTx = await roundFactory.create(
    encodedParameters,
    programContract, // _ownedBy (Program)
  );

  const receipt = await roundTx.wait();
  let roundAddress;

  if (receipt.events) {
    const event = receipt.events.find(e => e.event === 'RoundCreated');
    if (event && event.args) {
      roundAddress = event.args.roundAddress;
    }
  }

  console.log("Txn hash: " + roundTx.hash);
  console.log("✅ Round created: ", roundAddress);
}

const generateAndEncodeRoundParam = async (votingContract: string, payoutContract: string) => {

  const _currentTimestamp = (await ethers.provider.getBlock(
    await ethers.provider.getBlockNumber())
  ).timestamp;

  const roundMetaPtr = {
    protocol: 1,
    pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi"
  };

  const applicationMetaPtr = {
    protocol: 1,
    pointer: "bafkreih3mbwctlrnimkiizqvu3zu3blszn5uylqts22yvsrdh5y2kbxaia"
  };

  const roles = [
    '0x5cdb35fADB8262A3f88863254c870c2e6A848CcA',
    '0xB8cEF765721A6da910f14Be93e7684e9a3714123',
    '0xA2A6460f20E43dcC5F8f55714A969500c342d7CE',
    '0xf4c5c4deDde7A86b25E7430796441e209e23eBFB',
    '0x4873178BeA2DCd7022f0eF6c70048b0e05Bf9017',
    '0x6e8C1ADaEDb9A0A801dD50aFD95b5c07e9629C1E'
  ]

  const matchAmount = 1;
  const token = AddressZero;
  const roundFeePercentage = 0;
  const roundFeeAddress = '0x5cdb35fADB8262A3f88863254c870c2e6A848CcA';

  const initAddress = [
    votingContract, // votingStrategy
    payoutContract, // payoutStrategy
  ];

  const initRoundTime = [
    _currentTimestamp + 50,     // 1 hour later   appStartTime
    _currentTimestamp + 432000, // 5 days later   appEndTime
    _currentTimestamp + 7200,   // 2 hours later  roundStartTime
    _currentTimestamp + 864000, // 10 days later  roundEndTime
  ];

  const initMetaPtr = [
    roundMetaPtr,
    applicationMetaPtr,
  ];

  const initRoles = [
    roles,  // adminRoles
    roles   // roundOperators
  ];

  let params = [
    initAddress,
    initRoundTime,
    matchAmount,
    token,
    roundFeePercentage,
    roundFeeAddress,
    initMetaPtr,
    initRoles
  ];

  return encodeRoundParameters(params);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
