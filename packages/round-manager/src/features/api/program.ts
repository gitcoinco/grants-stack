import { CHAINS, fetchFromIPFS } from "./utils";
import { MetadataPointer, Program, Web3Instance } from "./types";
import { programFactoryContract } from "./contracts";
import { ethers } from "ethers";
import { datadogLogs } from "@datadog/browser-logs";
import { Signer } from "@ethersproject/abstract-signer";
import { ChainId, graphql_fetch } from "common";

/**
 * Fetch a list of programs
 * @param address - a valid program operator
 * @param signerOrProvider - provider
 *
 */
export async function listPrograms(
  address: string,
  signerOrProvider: Web3Instance["provider"]
): Promise<Program[]> {
  try {
    // fetch chain id
    const { chainId } = (await signerOrProvider.getNetwork()) as {
      chainId: ChainId;
    };

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

// TODO(shavinac) change params to expect chainId instead of signerOrProvider
export async function getProgramById(
  programId: string,
  signerOrProvider: Web3Instance["provider"]
): Promise<Program> {
  try {
    // fetch chain id
    const { chainId } = (await signerOrProvider.getNetwork()) as {
      chainId: ChainId;
    };

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
  signerOrProvider: Signer;
}

export async function deployProgramContract({
  program: { store: metadata, operatorWallets },
  signerOrProvider,
}: DeployProgramContractProps) {
  try {
    const chainId = await signerOrProvider.getChainId();
    const _programFactoryContract = programFactoryContract(chainId);
    const programFactory = new ethers.Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _programFactoryContract.address!,
      _programFactoryContract.abi,
      signerOrProvider
    );

    operatorWallets = operatorWallets.filter((e) => e !== "");

    const encodedParameters = encodeInputParameters(metadata, operatorWallets);

    // Deploy a new Program contract
    const tx = await programFactory.create(encodedParameters);
    const receipt = await tx.wait();
    let programAddress;

    if (receipt.events) {
      const event = receipt.events.find(
        (e: { event: string }) => e.event === "ProgramCreated"
      );
      if (event && event.args) {
        programAddress = event.args.programContractAddress; // program contract address from the event
      }
    }

    console.log("✅ Transaction hash: ", tx.hash);
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
  return ethers.utils.defaultAbiCoder.encode(
    ["tuple(uint256 protocol, string pointer)", "address[]", "address[]"],
    [metadata, operatorWallets.slice(0, 1), operatorWallets]
  );
}
