import { CHAINS } from "./utils";
import { Program, Web3Instance } from "./types";
import { datadogLogs } from "@datadog/browser-logs";
import { ChainId } from "common";
import { DataLayer } from "data-layer";
import { getAlloVersion } from "common/src/config";

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

    // fetch programs from indexer

    const programsRes = await dataLayer.getProgramsByUser({
      address,
      chainId,
      tags: getAlloVersion() === "allo-v1" ? ["allo-v1"] : [],
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
        tags: program.tags,
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
    tags: program.tags,
    chain: {
      id: chainId,
      name: CHAINS[chainId]?.name,
      logo: CHAINS[chainId]?.logo,
    },
  };
}
