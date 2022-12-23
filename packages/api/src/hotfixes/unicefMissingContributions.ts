import { MetaPtr, QFContribution } from "../types";
import fetch from "node-fetch";
import { BigNumber, ethers } from "ethers";
import { fetchPayoutAddressToProjectIdMapping } from "../utils";
import { getAddress } from "ethers/lib/utils";

export const addMissingUNICEFContributions = async (
  contributions: QFContribution[],
  projectIds?: string[]
): Promise<QFContribution[]> => {
  // console.log("Injecting missing UNICEF contributions");
  let missingContributions = await fetchMissingContributions();

  if (projectIds) {
    missingContributions = missingContributions.filter(
      (contribution: QFContribution) =>
        projectIds.includes(contribution.projectId)
    );
  }

  contributions.push(...missingContributions);

  return contributions;
};

const abi = ["function vote(bytes[] encodedVotes) payable"];

const iface = new ethers.utils.Interface(abi);

const fetchMissingContributions = async (): Promise<QFContribution[]> => {
  type Transaction = {
    from: string;
    input: string;
    hash: string;
  };

  const API_KEY = process.env.OPTIMISM_ETHERSCAN_API;
  const CONTRACT = "0xdf75054cd67217aee44b4f9e4ebc651c00330938";
  const START_BLOCK = "0";
  const END_BLOCK = "99999999";
  const OFFSET = "1000";

  if (!API_KEY || API_KEY == "") {
    throw Error(
      "error: fetchMissingContributions - OPTIMISM_ETHERSCAN_API not set"
    );
  }

  const url = `https://api-optimistic.etherscan.io/api?module=account&action=txlist&address=${CONTRACT}&startblock=${START_BLOCK}&endblock=${END_BLOCK}&page=1&offset=${OFFSET}&sort=asc&apikey=${API_KEY}`;

  const response = await fetch(url);

  const contributions: QFContribution[] = [];

  const data = await response.json();
  const result = data.result;

  // fetch projectId -> payoutAddress mapping
  const projectsMetaPtr: MetaPtr = {
    pointer: "bafkreica324tot55eqxnvock5gdo4etklzf4hz5oa3tmb4zvaerigbclfu",
    protocol: 1,
  };
  const projectPayoutToIdMapping = await fetchPayoutAddressToProjectIdMapping(
    projectsMetaPtr
  );

  result.forEach((txn: Transaction) => {
    try {
      const from = txn.from;

      const encodedInput = txn.input;
      const decodedInput = iface.decodeFunctionData("vote", encodedInput);

      const encodedVotes = decodedInput.encodedVotes;

      encodedVotes.forEach((encodedVote: string) => {
        const decodedVote = ethers.utils.defaultAbiCoder.decode(
          ["address", "uint256", "address"], // [token, amount, to]
          encodedVote
        );

        const payoutAddress = getAddress(decodedVote[2]);
        const projectId = projectPayoutToIdMapping.get(payoutAddress);

        const contribution: QFContribution = {
          contributor: from,
          token: decodedVote[0],
          amount: BigNumber.from(decodedVote[1].toString()),
          projectId: projectId!, // TODO: This should be the project id when it is ready
          projectPayoutAddress: payoutAddress,
        };

        contributions.push(contribution);
      });
    } catch (e) {
      // console.log("Skipping txn which is not vote:", txn.hash);
    }
  });

  return contributions;
};
