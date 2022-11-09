// This is a helper script to cast 3 votes to a round using QFVotingStrategy.
// This should be created via the frontend and this script is meant to be used for quick test
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../../utils/script-utils";
import { roundParams } from '../../config/round.config';
import { QFVotingParams } from "../../config/votingStrategy.config";
import * as utils from "../../utils";

utils.assertEnvironment();

export async function main() {

  const network = hre.network;

  const roundNetworkParams = roundParams[network.name];
  const votingNetworkParams = QFVotingParams[network.name];

  if (!roundNetworkParams || !votingNetworkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const grantRoundContract = roundNetworkParams.roundContract;
  const votingContract = votingNetworkParams.contract;

  if (!grantRoundContract) {
    throw new Error(`error: missing roundContract`);
  }

  if (!votingContract) {
    throw new Error(`error: missing votingContract`);
  }

  const grantRoundImplementation = await ethers.getContractAt('RoundImplementation', grantRoundContract);

  await confirmContinue({
    "contract"                : "GrantRoundImplementation Clone",
    "grantRoundContract"      : grantRoundContract,
    "votingStrategyContract"  : votingContract,
    "function"                : "vote",
    "network"                 : network.name,
    "chainId"                 : network.config.chainId
  });

  const tokenAddress = "0x7f329D36FeA6b3AD10E6e36f2728e7e6788a938D";

  const erc20Abi = [
    "constructor(string name_, string symbol_)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)",
    "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)"
  ];

  const signers = await ethers.getSigners();
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signers[0]);

  const approveTx = await tokenContract.approve(votingContract, 100);
  approveTx.wait();

  console.log("Approved Allowance");

  // Cast Vote
  const votes = [
    [
      tokenAddress, // token
      1, // amount
      "0x4873178BeA2DCd7022f0eF6c70048b0e05Bf9017" // grantAddress
    ],
    [
      tokenAddress, // token
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
