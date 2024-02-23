import { CHAINS } from "./utils";
import { MetadataPointer, Program, Web3Instance } from "./types";
import { programFactoryContract } from "./contracts";
import { ethers } from "ethers";
import { datadogLogs } from "@datadog/browser-logs";
import { Signer } from "@ethersproject/abstract-signer";
import { ChainId } from "common";
import { DataLayer } from "data-layer";
import { getConfig } from "common/src/config";

/**
 * Fetch a list of programs
 * @param address - a valid program operator
 * @param signerOrProvider - provider
 *
 */
export async function listPrograms(
  address: string,
  signerOrProvider: Web3Instance["provider"],
  dataLayer: DataLayer
): Promise<Program[]> {
  try {
    // fetch chain id
    const { chainId } = (await signerOrProvider.getNetwork()) as {
      chainId: ChainId;
    };

    const config = getConfig();

    // fetch programs from indexer

    const programsRes = await dataLayer.getProgramsByUser({
      address,
      chainId,
      alloVersion: config.allo.version,
    });

    if (!programsRes) {
      throw Error("Unable to fetch programs");
    }

    let programs: Program[] = [];

    for (const program of programsRes.programs) {
      programs.push({
        id: program.id,
        metadata: program.metadata,
        operatorWallets: program.roles.map(
          (role: { address: string }) => role.address
        ),
        chain: {
          id: chainId,
          name: CHAINS[chainId]?.name,
          logo: CHAINS[chainId]?.logo,
        },
        createdByAddress: program.createdByAddress,
      });
    }

    // Filter out programs where operatorWallets does not include round.createdByAddress.
    // This is to filter out spam rounds created by bots
    programs = programs.filter((program) => {
      return (
        program.createdByAddress &&
        program.operatorWallets?.includes(program.createdByAddress)
      );
    });

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
  signerOrProvider: Web3Instance["provider"],
  dataLayer: DataLayer
): Promise<Program | null> {
  // fetch chain id
  const { chainId } = (await signerOrProvider.getNetwork()) as {
    chainId: ChainId;
  };

  // fetch program from indexer
  const { program: program } = await dataLayer.getProgramById({
    programId,
    chainId,
  });

  // no program found
  if (program === null) {
    return null;
  }

  return {
    id: program.id,
    metadata: program.metadata,
    operatorWallets: program.roles.map(
      (role: { address: string }) => role.address
    ),
    chain: {
      id: chainId,
      name: CHAINS[chainId]?.name,
      logo: CHAINS[chainId]?.logo,
    },
  };
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
