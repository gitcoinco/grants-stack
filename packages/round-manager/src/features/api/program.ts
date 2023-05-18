import { CHAINS, fetchFromIPFS } from "./utils";
import { MetadataPointer, Program } from "./types";
import { programFactoryContract } from "./contracts";
import { datadogLogs } from "@datadog/browser-logs";
import { graphql_fetch } from "common";
import {
  decodeEventLog,
  encodeAbiParameters,
  getContract,
  Hex,
  parseAbiParameters,
  PublicClient,
} from "viem";
import { WalletClient } from "wagmi";
import { waitForTransaction } from "@wagmi/core";
import ProgramFactoryABI from "./abi/ProgramFactoryABI";
import ProgramImplementationABI from "./abi/ProgramImplementationABI";

/**
 * Fetch a list of programs
 * @param address - a valid program operator
 *
 * @param publicClient
 */
export async function listPrograms(
  address: string,
  publicClient: PublicClient
): Promise<Program[]> {
  try {
    const chainId = await publicClient.getChainId();

    // get the subgraph for all programs owned by the given address
    const res = await graphql_fetch(
      `
              query GetPrograms($address: String!) {
                programs(where: {
                  accounts_: {
                    address: $address
                  }
                }) {
                  id
                  metaPtr {
                    protocol
                    pointer
                  }
                  roles(where: {
                    role: "0xaa630204f2780b6f080cc77cc0e9c0a5c21e92eb0c6771e709255dd27d6de132"
                  }) {
                    accounts {
                      address
                    }
                  }
                }
              }
            `,
      chainId,
      { address: address.toLowerCase() }
    );

    const programs: Program[] = [];

    for (const program of res.data.programs) {
      const metadata = await fetchFromIPFS(program.metaPtr.pointer);

      programs.push({
        id: program.id,
        metadata,
        operatorWallets: program.roles[0].accounts.map(
          (account: { address: string }) => account.address
        ),
        chain: {
          id: chainId,
          name: CHAINS[chainId]?.name,
          logo: CHAINS[chainId]?.logo,
        },
      });
    }

    return programs;
  } catch (error) {
    datadogLogs.logger.error(`error: listPrograms - ${error}`);
    console.error("listPrograms", error);
    throw Error("Unable to fetch programs");
  }
}

export async function getProgramById(
  programId: string,
  publicClient: PublicClient
): Promise<Program> {
  try {
    const chainId = await publicClient.getChainId();

    // get the subgraph for program by $programId
    const res = await graphql_fetch(
      `
        query GetPrograms($programId: String) {
          programs(where: {
            id: $programId
          }) {
            id
            metaPtr {
              protocol
              pointer
            }
            roles(where: {
              role: "0xaa630204f2780b6f080cc77cc0e9c0a5c21e92eb0c6771e709255dd27d6de132"
            }) {
              accounts {
                address
              }
            }
          }
        }
      `,
      chainId,
      { programId }
    );

    const programDataFromGraph = res.data.programs[0];
    const metadata = await fetchFromIPFS(programDataFromGraph.metaPtr.pointer);

    return {
      id: programDataFromGraph.id,
      metadata,
      operatorWallets: programDataFromGraph.roles[0].accounts.map(
        (account: { address: string }) => account.address
      ),
      chain: {
        id: chainId,
        name: CHAINS[chainId]?.name,
        logo: CHAINS[chainId]?.logo,
      },
    };
  } catch (error) {
    datadogLogs.logger.error(`error: getProgramById - ${error}`);
    console.error("getProgramById", error);
    throw Error("Unable to fetch program");
  }
}

interface DeployProgramContractProps {
  program: {
    store: MetadataPointer;
    operatorWallets: string[];
  };
  walletClient: WalletClient;
}

export async function deployProgramContract({
  program: { store: metadata, operatorWallets },
  walletClient,
}: DeployProgramContractProps) {
  try {
    const chainId = await walletClient.getChainId();
    const _programFactoryContract = programFactoryContract(chainId);
    const programFactory = await getContract({
      address: _programFactoryContract.address as Hex,
      abi: ProgramFactoryABI,
      walletClient,
    });

    operatorWallets = operatorWallets.filter((e) => e !== "");

    const encodedParameters = encodeInputParameters(metadata, operatorWallets);

    const tx = await programFactory.write.create([encodedParameters]);
    const receipt = await waitForTransaction({
      hash: tx,
    });
    let programAddress;

    receipt.logs
      .map((log) => {
        try {
          return decodeEventLog({ ...log, abi: ProgramFactoryABI });
        } catch {
          /* This tx receipt also captures events emitted from the ProgramImplementation,
          so we try parsing it using ProgrampImplementation */
          return decodeEventLog({ ...log, abi: ProgramImplementationABI });
        }
      })
      .find((log) => {
        if (log.eventName === "ProgramCreated") {
          programAddress = log.args.programContractAddress;
        }
      });

    console.log("✅ Transaction hash: ", tx);
    console.log("✅ Program address: ", programAddress);
    const blockNumber = receipt.blockNumber;
    return {
      transactionBlockNumber: blockNumber,
    };
  } catch (error) {
    datadogLogs.logger.error(`error: deployProgramContract - ${error}`);
    console.error("deployProgramContract", error);
    throw new Error("Unable to create program");
  }
}

function encodeInputParameters(
  metadata: MetadataPointer,
  operatorWallets: string[]
) {
  const bigintMetadataPointer = {
    pointer: metadata.pointer,
    protocol: BigInt(metadata.protocol),
  };

  return encodeAbiParameters(
    parseAbiParameters([
      "(uint256 protocol, string pointer),address[],address[]",
    ]),
    [
      bigintMetadataPointer,
      operatorWallets.slice(0, 1) as Hex[],
      operatorWallets as Hex[],
    ]
  );
}
