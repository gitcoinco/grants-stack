import { Round } from "./types";
import { fetchFromIPFS, graphql_fetch } from "./utils";
import {
  qfVotingStrategyFactoryContract,
  roundFactoryContract,
} from "./contracts";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";

/**
 * Fetch a round by ID
 * @param signerOrProvider - provider
 * @param roundId - the ID of a specific round for detail
 */
export async function getRoundById(
  signerOrProvider: Web3Provider,
  roundId: string
): Promise<Round> {
  try {
    // fetch chain id
    const { chainId } = await signerOrProvider.getNetwork();

    // query the subgraph for all rounds by the given address in the given program
    const res = await graphql_fetch(
      `
          query GetRounds($address: String, $programId: String, $roundId: String) {
            rounds(where: {
        ${roundId ? `id: $roundId` : ``}
            }) {
              id
              program {
                id
              }
              roundMetaPtr {
                protocol
                pointer
              }
              applicationMetaPtr {
                protocol
                pointer
              }
              applicationsStartTime
              applicationsEndTime
              roundStartTime
              roundEndTime
              roles(where: {
                role: "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5"
              }) {
                accounts {
                  address
                }
              }
            }
          }
        `,
      chainId,
      { roundId }
    );

    // fetch round and application metadata from IPFS
    const [roundMetadata, applicationMetadata] = await Promise.all([
      fetchFromIPFS(res.data.rounds[0].roundMetaPtr.pointer),
      fetchFromIPFS(res.data.rounds[0].applicationMetaPtr.pointer),
    ]);

    const operatorWallets = res.data.rounds[0].roles[0].accounts.map(
      (account: { address: string }) => account.address
    );

    return {
      id: res.data.rounds[0].id,
      roundMetadata,
      applicationMetadata,
      applicationsStartTime: new Date(
        res.data.rounds[0].applicationsStartTime * 1000
      ),
      applicationsEndTime: new Date(
        res.data.rounds[0].applicationsEndTime * 1000
      ),
      roundStartTime: new Date(res.data.rounds[0].roundStartTime * 1000),
      roundEndTime: new Date(res.data.rounds[0].roundEndTime * 1000),
      token: res.data.rounds[0].token,
      votingStrategy: res.data.rounds[0].votingStrategy,
      ownedBy: res.data.rounds[0].program.id,
      operatorWallets: operatorWallets,
    };
  } catch (err) {
    console.log("error", err);
    throw "Unable to fetch round";
  }
}

/**
 * Fetch a list of rounds
 * @param address - a valid round operator
 * @param signerOrProvider - provider
 * @param programId - the ID of the program the round belongs to
 * @param roundId - the ID of a specific round for detail
 */
export async function listRounds(
  address: string,
  signerOrProvider: Web3Provider,
  programId: string,
  roundId?: string
): Promise<{ rounds: Round[] }> {
  try {
    // fetch chain id
    const { chainId } = await signerOrProvider.getNetwork();

    // query the subgraph for all rounds by the given address in the given program
    const res = await graphql_fetch(
      `
          query GetRounds($address: String, $programId: String, $roundId: String) {
            rounds(where: {
        ${address ? `accounts_: { address: $address } ` : ``}
        ${programId ? `program: $programId` : ``}
        ${roundId ? `id: $roundId` : ``}
            }) {
              id
              program {
                id
              }
              roundMetaPtr {
                protocol
                pointer
              }
              applicationMetaPtr {
                protocol
                pointer
              }
              applicationsStartTime
              applicationsEndTime
              roundStartTime
              roundEndTime
              roles(where: {
                role: "0xec61da14b5abbac5c5fda6f1d57642a264ebd5d0674f35852829746dfb8174a5"
              }) {
                accounts {
                  address
                }
              }
            }
          }
        `,
      chainId,
      { address: address?.toLowerCase(), programId, roundId }
    );

    const rounds: Round[] = [];

    for (const round of res.data.rounds) {
      // fetch round and application metadata from IPFS
      const [roundMetadata, applicationMetadata] = await Promise.all([
        fetchFromIPFS(round.roundMetaPtr.pointer),
        fetchFromIPFS(round.applicationMetaPtr.pointer),
      ]);

      const operatorWallets = round.roles[0].accounts.map(
        (account: { address: string }) => account.address
      );

      rounds.push({
        id: round.id,
        roundMetadata,
        applicationMetadata,
        applicationsStartTime: new Date(round.applicationsStartTime * 1000),
        applicationsEndTime: new Date(round.applicationsEndTime * 1000),
        roundStartTime: new Date(round.roundStartTime * 1000),
        roundEndTime: new Date(round.roundEndTime * 1000),
        token: round.token,
        votingStrategy: round.votingStrategy,
        ownedBy: round.program.id,
        operatorWallets: operatorWallets,
      });
    }

    return { rounds };
  } catch (err) {
    console.log("error", err);
    throw new Error("Unable to fetch rounds");
  }
}

export async function deployRoundContract(
  round: Round,
  signerOrProvider: Signer
): Promise<{ transactionBlockNumber: number }> {
  try {
    const chainId = await signerOrProvider.getChainId();

    const _roundFactoryContract = roundFactoryContract(chainId);
    const roundFactory = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _roundFactoryContract.address!,
      _roundFactoryContract.abi,
      signerOrProvider
    );

    if (!round.applicationsEndTime) {
      round.applicationsEndTime = round.roundStartTime;
    }

    round.operatorWallets = round.operatorWallets?.filter((e) => e !== "");

    // encode input parameters
    const params = [
      round.votingStrategy,
      "0xAD8E33940a0275651FC4a3a5Ab26a53067e5E50A", // TODO replace with real payout contract when implemented
      new Date(round.applicationsStartTime).getTime() / 1000,
      new Date(round.applicationsEndTime).getTime() / 1000,
      new Date(round.roundStartTime).getTime() / 1000,
      new Date(round.roundEndTime).getTime() / 1000,
      round.token,
      round.store,
      round.applicationStore,
      round.operatorWallets?.slice(0, 1),
      round.operatorWallets,
    ];

    const encodedParameters = ethers.utils.defaultAbiCoder.encode(
      [
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "tuple(uint256 protocol, string pointer)",
        "tuple(uint256 protocol, string pointer)",
        "address[]",
        "address[]",
      ],
      params
    );

    // Deploy a new Round contract
    const tx = await roundFactory.create(encodedParameters, round.ownedBy);

    const receipt = await tx.wait(); // wait for transaction receipt

    let roundAddress;

    if (receipt.events) {
      const event = receipt.events.find(
        (e: { event: string }) => e.event === "RoundCreated"
      );
      if (event && event.args) {
        roundAddress = event.args.roundAddress;
      }
    }

    console.log("✅ Transaction hash: ", tx.hash);
    console.log("✅ Round address: ", roundAddress);

    const blockNumber = receipt.blockNumber;
    return {
      transactionBlockNumber: blockNumber,
    };
  } catch (err) {
    console.log("error", err);
    throw new Error("Unable to create round");
  }
}

// Consider moving this into its own file
export const deployQFVotingContract = async (
  signerOrProvider: Signer
): Promise<void> => {
  try {
    const chainId = await signerOrProvider.getChainId();

    const _QFVotingStrategyFactory = qfVotingStrategyFactoryContract(chainId); //roundFactoryContract(chainId);
    const qfVotingStrategyFactory = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _QFVotingStrategyFactory.address!,
      _QFVotingStrategyFactory.abi,
      signerOrProvider
    );

    // Deploy a new QF Voting Strategy contract
    const tx = await qfVotingStrategyFactory.create();

    const receipt = await tx.wait(); // wait for transaction receipt

    let votingStrategyAddress;

    if (receipt.events) {
      const event = receipt.events.find(
        (e: { event: string }) => e.event === "VotingContractCreated"
      );
      if (event && event.args) {
        votingStrategyAddress = event.args.votingContractAddress;
      }
    } else {
      throw new Error("No VotingContractCreated event");
    }

    console.log("✅ Transaction hash: ", tx.hash);
    console.log("✅ Round address: ", votingStrategyAddress);

    return votingStrategyAddress;
  } catch (err) {
    console.log("error", err);
    throw new Error("Unable to create qf voting contract");
  }
};
