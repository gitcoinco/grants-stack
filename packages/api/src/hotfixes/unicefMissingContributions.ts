import {QFContribution} from "../types";
import fetch from 'node-fetch';
import { ethers } from "ethers";
const fs = require('fs');

export const addMissingUNICEFContributions = async (contributions: QFContribution[]): Promise<QFContribution[]> => {

  const missingContributions = await fetchMissingContributions();
  contributions.push(...missingContributions);

  return contributions;
}

const abi = [ 
  "function vote(bytes[] encodedVotes) payable",
];


const iface = new ethers.utils.Interface(abi);

const fetchMissingContributions = async () : Promise<QFContribution[]> => {

  const API_KEY = process.env.OPTIMISM_ETHERSCAN_API;
  const CONTRACT = "0xdf75054cd67217aee44b4f9e4ebc651c00330938";
  const START_BLOCK = "0";
  const END_BLOCK = "99999999";
  const OFFSET = "1000";

  if (!API_KEY || API_KEY == "") {
    throw Error("error: fetchMissingContributions - OPTIMISM_ETHERSCAN_API not set");
  }

  const url = `https://api-optimistic.etherscan.io/api?module=account&action=txlist&address=${CONTRACT}&startblock=${START_BLOCK}&endblock=${END_BLOCK}&page=1&offset=${OFFSET}&sort=asc&apikey=${API_KEY}`

  const response = await fetch(url);

  const contributions: any = [];

  const data = await response.json();
  const result = data.result;

  console.log("Total txn count:", result.length);

  result.forEach((txn: any) => {
    try {

      const from = txn.from;

      const encodedInput = txn.input;
      const decodedInput = iface.decodeFunctionData('vote', encodedInput)

      const encodedVotes = decodedInput.encodedVotes;

      encodedVotes.forEach((encodedVote: any) => {

      const decodedVote = ethers.utils.defaultAbiCoder.decode(
        ["address", "uint256", "address"], // [token, amount, to]
        encodedVote
      )

      const contribution: QFContribution = {
        contributor: from,
        token: decodedVote[0],
        amount: decodedVote[1].toString(),
        projectId: decodedVote[2]
      };

      contributions.push(contribution);      
      
    });
    } catch(e) {
      console.log("Skipping txn which is not vote:", txn.hash)
    }
 
  });
 
  fs.writeFile("./unicef-optimism-contribution.json", JSON.stringify(contributions), () => {
    console.log("written to file");
  })

  return contributions;
}
