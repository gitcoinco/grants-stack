// This is a helper script to create a round. 
// This should be created via the frontend and this script is meant to be used for quick test
// NOTE: this script deploys a round with a QF voting strategy
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';
import { programParams } from "../config/program.config";
import { QFVotingParams } from "../config/votingStrategy.config";
import { encodeRoundParameters } from "../utils";
import * as utils from "../utils";

utils.assertEnvironment();
  
export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];
  const programNetworkParams = programParams[network.name];
  const votingNetworkParams = QFVotingParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const roundFactoryContract = networkParams.roundFactoryContract;
  const roundImplementationContract = networkParams.roundImplementationContract;
  const programContract = programNetworkParams.programContract;

  const votingContract = votingNetworkParams.contract;
  
  if (!roundFactoryContract) {
    throw new Error(`error: missing roundFactoryContract`);
  }

  if (!roundImplementationContract) {
    throw new Error(`error: missing roundImplementationContract`);
  }

  if (!votingContract) {
    throw new Error(`error: missing votingContract`);
  }

  const roundFactory = await ethers.getContractAt('RoundFactory', roundFactoryContract);
  
  await confirmContinue({
    "info"                         : "create a Round",
    "roundFactoryContract"         : roundFactoryContract,
    "roundImplementationContract"  : roundImplementationContract,
    "programContractAddress"       : programContract,
    "votingContractAddress"        : votingContract,
    "network"                      : network.name,
    "chainId"                      : network.config.chainId
  });

  const applicationsStartTime = Math.round(new Date().getTime() / 1000 + 3600); // 1 hour later
  const applicationsEndTime = Math.round(new Date().getTime() / 1000 + 86400); // 1 day later
  const roundStartTime = Math.round(new Date().getTime() / 1000 + 172800); // 2 days later
  const roundEndTime = Math.round(new Date().getTime() / 1000 + 864000); // 10 days later
    
  const params = [
    votingContract, // _votingStrategyAddress
    applicationsStartTime, // _applicationsStartTime
    applicationsEndTime, // _applicationsEndTime
    roundStartTime, // _roundStartTime
    roundEndTime, // _roundEndTime
    '0x7f329D36FeA6b3AD10E6e36f2728e7e6788a938D', // _token
    { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" }, // _roundMetaPtr
    { protocol: 1, pointer: "bafkreih3mbwctlrnimkiizqvu3zu3blszn5uylqts22yvsrdh5y2kbxaia" }, // _applicationMetaPtr
    [
      '0x5cdb35fADB8262A3f88863254c870c2e6A848CcA',
      '0xB8cEF765721A6da910f14Be93e7684e9a3714123'
    ], // _adminRoles
    [
      '0x5cdb35fADB8262A3f88863254c870c2e6A848CcA',
      '0xB8cEF765721A6da910f14Be93e7684e9a3714123',
      '0xf4c5c4deDde7A86b25E7430796441e209e23eBFB',
      '0x4873178BeA2DCd7022f0eF6c70048b0e05Bf9017',
      '0x6e8C1ADaEDb9A0A801dD50aFD95b5c07e9629C1E'
    ] // _roundOperators
  ];
  
  const encodedParameters = encodeRoundParameters(params);
  
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
