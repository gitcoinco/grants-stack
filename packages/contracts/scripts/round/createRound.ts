// This is a helper script to create a round. 
// This should be created via the frontend and this script is meant to be used for quick test
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { roundParams } from '../config/round.config';
  
export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const roundFactoryContract = networkParams.roundFactoryContract;
  const roundImplementationContract = networkParams.roundImplementationContract;

  
  if (!roundFactoryContract) {
    throw new Error(`error: missing roundFactoryContract`);
  }

  if (!roundImplementationContract) {
    throw new Error(`error: missing roundImplementationContract`);
  }

  const programContractAddress = "0x1564f459600505734cffe7a075691db96e517ae7";

  const roundFactory = await ethers.getContractAt('RoundFactory', roundFactoryContract);
  
  await confirmContinue({
    "info"                         : "create a Round",
    "roundFactoryContract"         : roundFactoryContract,
    "roundImplementationContract"  : roundImplementationContract,
    "programContractAddress"       : programContractAddress,
    "network"                      : network.name,
    "chainId"                      : network.config.chainId
  });

  const startTime = Math.round(new Date().getTime() / 1000 + 3600); // 1 hour later
  const applicationStartTime = Math.round(new Date().getTime() / 1000 + 172800); // 2 days later
  const endTime = Math.round(new Date().getTime() / 1000 + 864000); // 10 days later
    
  const roundTx = await roundFactory.create(
      networkParams.bulkVotingStrategyContract, // _votingStrategyAddress
      applicationStartTime, // _applicationsStartTime
      startTime, // _roundStartTime
      endTime, // _roundEndTime
      '0x7f329D36FeA6b3AD10E6e36f2728e7e6788a938D', // _token
      programContractAddress, // _ownedBy (Program)
      { protocol: 1, pointer: "bafybeia4khbew3r2mkflyn7nzlvfzcb3qpfeftz5ivpzfwn77ollj47gqi" }, // _roundMetaPtr
      { protocol: 1, pointer: "bafybeiaoakfoxjwi2kwh43djbmomroiryvhv5cetg74fbtzwef7hzzvrnq" }, // _applicationMetaPtr
      ['0x5cdb35fADB8262A3f88863254c870c2e6A848CcA', '0xB8cEF765721A6da910f14Be93e7684e9a3714123'] // _roundOperators
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
