import { Program, Web3Instance } from "./types";
import { datadogLogs } from "@datadog/browser-logs";
import { DataLayer } from "data-layer";
import { getAlloVersion } from "common/src/config";
import { getChainById, stringToBlobUrl } from "common";

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
      chainId: number;
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

    const programs: Program[] = [];

    for (const program of programsRes.programs) {
      const chain = getChainById(chainId);
      programs.push({
        id: program.id,
        metadata: program.metadata,
        operatorWallets: program.roles.map(
          (role: { address: string }) => role.address
        ),
        tags: program.tags,
        chain: {
          id: chainId,
          name: chain.prettyName,
          logo: stringToBlobUrl(chain.icon),
        },
        createdByAddress: program.createdByAddress,
        roles: program.roles,
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
  signerOrProvider: Web3Instance["provider"],
  dataLayer: DataLayer
): Promise<Program | null> {
  // fetch chain id
  const { chainId } = (await signerOrProvider.getNetwork()) as {
    chainId: number;
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

  const chain = getChainById(chainId);

  return {
    id: program.id,
    metadata: program.metadata,
    operatorWallets: program.roles.map(
      (role: { address: string }) => role.address
    ),
    tags: program.tags,
    chain: {
      id: chainId,
      name: chain.prettyName,
      logo: stringToBlobUrl(chain.icon),
    },
    roles: program.roles,
  };
}
