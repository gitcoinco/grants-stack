// This is a helper script to cast 3 votes to a round using QFVotingStrategy. 
// This should be created via the frontend and this script is meant to be used for quick test
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { roundParams } from '../../config/round.config';
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main() {

  const network = hre.network;

  const networkParams = roundParams[network.name];
  
  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }
  
  const grantRoundContract = networkParams.roundContract;

  if (!grantRoundContract) {
    throw new Error(`error: missing roundContract`);
  }

  const grantRoundImplementation = await ethers.getContractAt('RoundImplementation', grantRoundContract);
  
  await confirmContinue({
    "contract"                : "GrantRoundImplementation Clone",
    "grantRoundContract"      : grantRoundContract,
    "votingStrategyContract"  : networkParams.roundContract,
    "function"                : "vote",
    "network"                 : network.name,
    "chainId"                 : network.config.chainId
  });

  // Cast Vote
  const votes = [
    [
      "0x7f329D36FeA6b3AD10E6e36f2728e7e6788a938D", // token
      1, // amount           
      "0x500Df079BEBE24A9f6FFa2c70fb58000A4722784" // grantAddress
    ],
    [
      "0x7f329D36FeA6b3AD10E6e36f2728e7e6788a938D", // token
      2,  // amount       
      "0xB8cEF765721A6da910f14Be93e7684e9a3714123" // grantAddress
    ]
  ];

  const encodedVotes = [];

  for (let i = 0; i < votes.length; i++) {
    encodedVotes.push(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "address"],
        votes[i]
      )
    );
  }

  const updateTx = await grantRoundImplementation.vote(encodedVotes);
  await updateTx.wait();

  console.log("✅ Vote Casted Successfully", updateTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
