// yarn hardhat run scripts/votingMechanism/castBulkVotingStrategy.ts --network goerli
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


  const grantRoundContract = '0x9dac496d2216a9092524f0c06b69d7194d9aa8b3';

  const grantRoundImplementation = await ethers.getContractAt('GrantRoundImplementation', grantRoundContract);
  
  await confirmContinue({
    "contract"                : "GrantRoundImplementation Clone",
    "grantRoundContract"      : grantRoundContract,
    "votingStrategyContract"  : networkParams.quadraticFundingVotingStrategyContract,
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
